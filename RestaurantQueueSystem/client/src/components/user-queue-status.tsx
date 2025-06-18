import { useQuery } from "@tanstack/react-query";
import { QrCode, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const restaurantDisplayNames: Record<string, string> = {
  "bella-vista": "Bella Vista Italian",
  "sakura-sushi": "Sakura Sushi",
  "prime-steakhouse": "Prime Steakhouse",
  "garden-bistro": "Garden Bistro",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ready":
      return "bg-accent-custom";
    case "Waiting":
      return "bg-warning-custom";
    case "Seated":
      return "bg-info-custom";
    default:
      return "bg-gray-500";
  }
};

export default function UserQueueStatus() {
  const { isAuthenticated } = useAuth();

  const { data: queueData, isLoading } = useQuery<{ entry: any }>({
    queryKey: ["/api/queue/my-entry"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!queueData || !queueData.entry) {
    return null; // No active queue entry
  }

  const { entry } = queueData;
  const restaurantName = restaurantDisplayNames[entry.restaurant] || entry.restaurant;
  const etaTime = new Date(entry.eta).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const timeRemaining = Math.max(0, Math.floor((new Date(entry.eta).getTime() - Date.now()) / (1000 * 60)));

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-2">Your Queue Status</h2>
          <p className="text-gray-600">Show this QR code when you arrive at the restaurant</p>
        </div>

        <Card className="shadow-xl border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-custom to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{restaurantName}</h3>
                <p className="text-orange-100">Party of {entry.partySize}</p>
              </div>
              <Badge className={`${getStatusColor(entry.status)} text-white text-lg px-4 py-2`}>
                {entry.status}
              </Badge>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-lg inline-block">
                  <img 
                    src={entry.qrCodeUrl} 
                    alt="Queue QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <QrCode size={16} />
                    <span>Show this QR code at the restaurant</span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="text-primary-custom" size={20} />
                      <span className="font-semibold text-gray-700">ETA</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary-custom">{etaTime}</div>
                    <div className="text-sm text-gray-600">
                      {timeRemaining > 0 ? `~${timeRemaining} min remaining` : "Ready soon!"}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="text-accent-custom" size={20} />
                      <span className="font-semibold text-gray-700">Party Size</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary-custom">{entry.partySize}</div>
                    <div className="text-sm text-gray-600">
                      {entry.partySize === 1 ? "person" : "people"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="text-info-custom" size={20} />
                    <span className="font-semibold text-gray-700">Restaurant</span>
                  </div>
                  <div className="text-lg font-semibold text-secondary-custom">{restaurantName}</div>
                  <div className="text-sm text-gray-600">
                    Joined: {new Date(entry.joinTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {entry.status === "Ready" && (
                  <div className="bg-accent-custom/10 border border-accent-custom/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="text-accent-custom" size={20} />
                      <span className="font-semibold text-accent-custom">Your table is ready!</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Please head to the restaurant now and show your QR code to the host.
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="w-full bg-primary-custom text-white hover:bg-orange-600 transition-colors">
                    <QrCode className="mr-2" size={16} />
                    Download QR Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}