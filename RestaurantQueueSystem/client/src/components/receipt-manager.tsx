import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, DollarSign, Calendar, User, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

interface ReceiptData {
  id: number;
  restaurant: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

const restaurantDisplayNames: Record<string, string> = {
  "bella-vista": "Bella Vista Italian",
  "sakura-sushi": "Sakura Sushi",
  "prime-steakhouse": "Prime Steakhouse",
  "garden-bistro": "Garden Bistro",
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function ReceiptCard({ receipt }: { receipt: ReceiptData }) {
  const restaurantName = restaurantDisplayNames[receipt.restaurant] || receipt.restaurant;
  const receiptDate = new Date(receipt.createdAt).toLocaleDateString();
  const receiptTime = new Date(receipt.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Card className="shadow-lg border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-custom to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{restaurantName}</h3>
            <p className="text-orange-100 text-sm">{receiptDate} at {receiptTime}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(receipt.total)}</div>
            <Badge className="bg-white/20 text-white text-xs">
              {receipt.paymentMethod}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Items */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
            <div className="space-y-1">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
            {receipt.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Tip</span>
                <span>{formatCurrency(receipt.tip)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          {/* Transaction ID */}
          {receipt.transactionId && (
            <div className="text-xs text-gray-500 text-center border-t pt-2">
              Transaction: {receipt.transactionId}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReceiptManager() {
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<"user" | "restaurant">("user");
  const [selectedRestaurant, setSelectedRestaurant] = useState("bella-vista");

  const { data: userReceipts = [], isLoading: userReceiptsLoading } = useQuery<ReceiptData[]>({
    queryKey: ["/api/receipts/my-receipts"],
    enabled: isAuthenticated && viewMode === "user",
  });

  const { data: restaurantReceipts = [], isLoading: restaurantReceiptsLoading } = useQuery<ReceiptData[]>({
    queryKey: ["/api/receipts/restaurant", selectedRestaurant],
    enabled: viewMode === "restaurant",
  });

  if (!isAuthenticated) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border-gray-100">
            <CardContent className="p-8 text-center">
              <Receipt className="mx-auto text-primary-custom mb-4" size={48} />
              <h3 className="text-2xl font-bold text-secondary-custom mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in to view your receipts and transaction history.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary-custom text-white hover:bg-orange-600 transition-colors font-medium"
              >
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const isLoading = viewMode === "user" ? userReceiptsLoading : restaurantReceiptsLoading;
  const receipts = viewMode === "user" ? userReceipts : restaurantReceipts;

  return (
    <section id="receipts" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">Receipt History</h2>
          <p className="text-gray-600 text-lg">
            {viewMode === "user" 
              ? "View your dining receipts and transaction history"
              : "Manage restaurant receipts and sales records"
            }
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode("user")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === "user"
                  ? "bg-primary-custom text-white shadow-sm"
                  : "text-gray-600 hover:text-primary-custom"
              }`}
            >
              <User className="inline mr-2" size={16} />
              My Receipts
            </button>
            <button
              onClick={() => setViewMode("restaurant")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === "restaurant"
                  ? "bg-primary-custom text-white shadow-sm"
                  : "text-gray-600 hover:text-primary-custom"
              }`}
            >
              <Store className="inline mr-2" size={16} />
              Restaurant View
            </button>
          </div>
        </div>

        {/* Restaurant Selector for Restaurant View */}
        {viewMode === "restaurant" && (
          <div className="flex justify-center mb-8">
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-custom focus:border-transparent"
            >
              {Object.entries(restaurantDisplayNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Receipts Grid */}
        {!isLoading && (
          <>
            {receipts.length === 0 ? (
              <Card className="shadow-lg border-gray-100">
                <CardContent className="p-12 text-center">
                  <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Receipts Found</h3>
                  <p className="text-gray-500">
                    {viewMode === "user" 
                      ? "You haven't made any purchases yet. Start dining to see your receipts here!"
                      : `No receipts found for ${restaurantDisplayNames[selectedRestaurant]}.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(receipts as ReceiptData[]).map((receipt: ReceiptData) => (
                  <ReceiptCard key={receipt.id} receipt={receipt} />
                ))}
              </div>
            )}

            {/* Summary Stats for Restaurant View */}
            {viewMode === "restaurant" && receipts.length > 0 && (
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                <Card className="shadow-lg border-gray-100">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="mx-auto text-accent-custom mb-3" size={32} />
                    <div className="text-2xl font-bold text-secondary-custom">
                      {formatCurrency((receipts as ReceiptData[]).reduce((sum: number, r: ReceiptData) => sum + r.total, 0))}
                    </div>
                    <div className="text-gray-600">Total Revenue</div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-gray-100">
                  <CardContent className="p-6 text-center">
                    <Receipt className="mx-auto text-primary-custom mb-3" size={32} />
                    <div className="text-2xl font-bold text-secondary-custom">{receipts.length}</div>
                    <div className="text-gray-600">Total Transactions</div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-gray-100">
                  <CardContent className="p-6 text-center">
                    <Calendar className="mx-auto text-info-custom mb-3" size={32} />
                    <div className="text-2xl font-bold text-secondary-custom">
                      {formatCurrency((receipts as ReceiptData[]).reduce((sum: number, r: ReceiptData) => sum + r.total, 0) / receipts.length)}
                    </div>
                    <div className="text-gray-600">Average Order</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}