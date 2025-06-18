import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QueueEntry } from "@shared/schema";

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
    default:
      return "bg-info-custom";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "Ready":
      return "Ready Soon";
    case "Waiting":
      return "Waiting";
    default:
      return "In Queue";
  }
};

function RestaurantQueueCard({ restaurant, entries }: { restaurant: string; entries: QueueEntry[] }) {
  const waitingEntries = entries.filter(entry => entry.status === "Waiting").slice(0, 3);
  const avgWait = waitingEntries.length > 0 ? "45 min" : "No wait";
  const queueLength = waitingEntries.length;

  const isAccentRestaurant = restaurant === "sakura-sushi";

  return (
    <Card className="shadow-lg border-gray-100 overflow-hidden">
      <div className={`${isAccentRestaurant ? 'bg-gradient-to-r from-accent-custom to-green-500' : 'bg-gradient-to-r from-primary-custom to-orange-500'} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-bold">{restaurantDisplayNames[restaurant] || restaurant}</h3>
            <p className={`${isAccentRestaurant ? 'text-green-100' : 'text-orange-100'}`}>
              {restaurant === "bella-vista" ? "Downtown • Italian Cuisine" : 
               restaurant === "sakura-sushi" ? "Midtown • Japanese Cuisine" :
               restaurant === "prime-steakhouse" ? "Uptown • Steakhouse" :
               "Downtown • Bistro"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{queueLength}</div>
            <div className={`text-sm ${isAccentRestaurant ? 'text-green-100' : 'text-orange-100'}`}>in queue</div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent-custom rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Average Wait:</span>
          </div>
          <span className="text-lg font-bold text-secondary-custom">{avgWait}</span>
        </div>
        
        {waitingEntries.length > 0 ? (
          <div className="space-y-3">
            {waitingEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${index === 0 ? 'bg-primary-custom' : 'bg-gray-400'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{entry.name.split(' ')[0]} {entry.name.split(' ')[1]?.[0]}.</div>
                    <div className="text-sm text-gray-500">Party of {entry.partySize}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${index === 0 ? 'text-accent-custom' : 'text-warning-custom'}`}>
                    {index === 0 ? "Ready Soon" : "Waiting"}
                  </div>
                  <div className="text-xs text-gray-500">
                    ~{index === 0 ? '5' : (index + 1) * 10} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No customers in queue
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button variant="ghost" className={`${isAccentRestaurant ? 'text-accent-custom hover:text-green-600' : 'text-primary-custom hover:text-orange-600'} text-sm font-medium`}>
            View All Positions <ArrowRight className="ml-1" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function QueueStatus() {
  const { data: allQueues = [], isLoading } = useQuery<QueueEntry[]>({
    queryKey: ["/api/queue"],
  });

  if (isLoading) {
    return (
      <section id="status" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">Loading queue status...</div>
        </div>
      </section>
    );
  }

  // Group queues by restaurant
  const queuesByRestaurant = allQueues.reduce((acc, entry) => {
    if (!acc[entry.restaurant]) {
      acc[entry.restaurant] = [];
    }
    acc[entry.restaurant].push(entry);
    return acc;
  }, {} as Record<string, QueueEntry[]>);

  // Show only restaurants with active queues, or show featured restaurants
  const featuredRestaurants = ["bella-vista", "sakura-sushi"];
  const restaurantsToShow = Object.keys(queuesByRestaurant).length > 0 
    ? Object.keys(queuesByRestaurant) 
    : featuredRestaurants;

  return (
    <section id="status" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">Current Queue Status</h2>
          <p className="text-gray-600 text-lg">Real-time updates for all active restaurant queues</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {restaurantsToShow.map((restaurant) => (
            <RestaurantQueueCard
              key={restaurant}
              restaurant={restaurant}
              entries={queuesByRestaurant[restaurant] || []}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
