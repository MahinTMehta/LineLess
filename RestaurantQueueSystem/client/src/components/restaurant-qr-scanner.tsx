import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QrCode, CheckCircle, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const restaurantDisplayNames: Record<string, string> = {
  "bella-vista": "Bella Vista Italian",
  "sakura-sushi": "Sakura Sushi",
  "prime-steakhouse": "Prime Steakhouse",
  "garden-bistro": "Garden Bistro",
};

export default function RestaurantQrScanner() {
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [verifiedEntry, setVerifiedEntry] = useState<any>(null);
  const { toast } = useToast();

  const verifyQrMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await apiRequest("POST", "/api/queue/verify-qr", { qrCode });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setVerifiedEntry(data.entry);
        toast({
          title: "QR Code Verified",
          description: `Customer: ${data.entry.name} - Party of ${data.entry.partySize}`,
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerifyQr = () => {
    if (!qrCodeInput.trim()) {
      toast({
        title: "QR Code Required",
        description: "Please enter a QR code to verify",
        variant: "destructive",
      });
      return;
    }
    verifyQrMutation.mutate(qrCodeInput.trim());
  };

  const handleClear = () => {
    setQrCodeInput("");
    setVerifiedEntry(null);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">QR Code Verification</h2>
          <p className="text-gray-600 text-lg">Scan or enter customer QR codes to verify their queue status</p>
        </div>

        <Card className="shadow-lg border-gray-100">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* QR Code Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer QR Code
                </label>
                <div className="flex space-x-3">
                  <Input
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Enter or scan QR code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-custom focus:border-transparent transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyQr()}
                  />
                  <Button
                    onClick={handleVerifyQr}
                    disabled={verifyQrMutation.isPending}
                    className="bg-primary-custom text-white hover:bg-orange-600 transition-colors px-6"
                  >
                    <Search className="mr-2" size={16} />
                    {verifyQrMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                  {(qrCodeInput || verifiedEntry) && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="border-gray-300 px-6"
                    >
                      <X className="mr-2" size={16} />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Verification Result */}
              {verifiedEntry && (
                <div className="bg-accent-custom/10 border border-accent-custom/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="text-accent-custom" size={24} />
                    <h3 className="text-xl font-bold text-secondary-custom">Customer Verified</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <div className="text-lg font-semibold text-secondary-custom">
                          {verifiedEntry.name}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Restaurant
                        </label>
                        <div className="text-lg text-gray-800">
                          {restaurantDisplayNames[verifiedEntry.restaurant] || verifiedEntry.restaurant}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Party Size
                        </label>
                        <div className="text-lg text-gray-800">
                          {verifiedEntry.partySize} {verifiedEntry.partySize === 1 ? "person" : "people"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Status
                        </label>
                        <Badge 
                          className={`${verifiedEntry.status === "Waiting" ? "bg-warning-custom" : 
                                      verifiedEntry.status === "Ready" ? "bg-accent-custom" : 
                                      "bg-info-custom"} text-white text-sm px-3 py-1`}
                        >
                          {verifiedEntry.status}
                        </Badge>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Join Time
                        </label>
                        <div className="text-lg text-gray-800">
                          {new Date(verifiedEntry.joinTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Expected Time
                        </label>
                        <div className="text-lg text-gray-800">
                          {new Date(verifiedEntry.eta).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-accent-custom/20">
                    <div className="flex space-x-3">
                      <Button className="bg-accent-custom text-white hover:bg-green-600 transition-colors">
                        <CheckCircle className="mr-2" size={16} />
                        Seat Customer
                      </Button>
                      <Button variant="outline" className="border-gray-300">
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-3">How to use:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <QrCode className="text-primary-custom mt-0.5" size={16} />
                    <span>Ask customers to show their QR code from the TableQ app</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Search className="text-primary-custom mt-0.5" size={16} />
                    <span>Enter or scan the QR code to verify their queue status</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-primary-custom mt-0.5" size={16} />
                    <span>Update customer status when their table is ready</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}