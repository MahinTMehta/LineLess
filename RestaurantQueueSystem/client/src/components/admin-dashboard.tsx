import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Settings, Users, Clock, CheckCircle, TrendingUp, Check, Edit, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QueueEntry } from "@shared/schema";

interface Stats {
  totalQueue: number;
  avgWait: string;
  tablesServed: number;
  peakHour: string;
}

const restaurantDisplayNames: Record<string, string> = {
  "bella-vista": "Bella Vista Italian",
  "sakura-sushi": "Sakura Sushi", 
  "prime-steakhouse": "Prime Steakhouse",
  "garden-bistro": "Garden Bistro",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: allQueues = [], isLoading: queuesLoading, refetch } = useQuery<QueueEntry[]>({
    queryKey: ["/api/queue"],
  });

  const updateQueueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<QueueEntry> }) => {
      const response = await apiRequest("PATCH", `/api/queue/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Queue updated successfully",
        description: "Customer status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update queue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromQueueMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/queue/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer removed from queue",
        description: "The customer has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove customer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSeatCustomer = (id: number) => {
    updateQueueMutation.mutate({ id, updates: { status: "Seated" } });
  };

  const handleRemoveCustomer = (id: number) => {
    if (confirm("Are you sure you want to remove this customer from the queue?")) {
      removeFromQueueMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
  };

  const filteredQueues = selectedRestaurant === "all" 
    ? allQueues 
    : allQueues.filter(entry => entry.restaurant === selectedRestaurant);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Waiting":
        return <Badge className="bg-warning-custom text-white">Waiting</Badge>;
      case "Ready":
        return <Badge className="bg-accent-custom text-white">Ready</Badge>;
      case "Seated":
        return <Badge className="bg-info-custom text-white">Seated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <section id="admin" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">Restaurant Admin Dashboard</h2>
            <p className="text-gray-600 text-lg">Manage your restaurant queues and monitor real-time activity</p>
          </div>
          <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <Button className="bg-accent-custom text-white hover:bg-green-600 transition-all font-medium">
              <Download className="mr-2" size={16} />
              Export Data
            </Button>
            <Button className="bg-primary-custom text-white hover:bg-orange-600 transition-all font-medium">
              <Settings className="mr-2" size={16} />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-custom to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total in Queue</p>
                  <p className="text-3xl font-bold">{statsLoading ? "..." : stats?.totalQueue || 0}</p>
                </div>
                <Users className="text-2xl text-orange-200" size={32} />
              </div>
              <div className="mt-4 text-sm text-orange-100">
                <TrendingUp className="inline mr-1" size={14} />
                Live count
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent-custom to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Avg Wait Time</p>
                  <p className="text-3xl font-bold">{statsLoading ? "..." : stats?.avgWait || "0 min"}</p>
                </div>
                <Clock className="text-2xl text-green-200" size={32} />
              </div>
              <div className="mt-4 text-sm text-green-100">
                <TrendingUp className="inline mr-1" size={14} />
                Current average
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info-custom to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tables Served</p>
                  <p className="text-3xl font-bold">{statsLoading ? "..." : stats?.tablesServed || 0}</p>
                </div>
                <CheckCircle className="text-2xl text-blue-200" size={32} />
              </div>
              <div className="mt-4 text-sm text-blue-100">
                <TrendingUp className="inline mr-1" size={14} />
                Today's count
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning-custom to-yellow-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Peak Hour</p>
                  <p className="text-3xl font-bold">{statsLoading ? "..." : stats?.peakHour || "N/A"}</p>
                </div>
                <TrendingUp className="text-2xl text-yellow-200" size={32} />
              </div>
              <div className="mt-4 text-sm text-yellow-100">
                <TrendingUp className="inline mr-1" size={14} />
                Busiest today
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Management Table */}
        <Card className="shadow-lg border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Active Queue Management</h3>
              <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {Object.entries(restaurantDisplayNames).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleRefresh}
                  className="bg-primary-custom text-white hover:bg-orange-600 transition-colors"
                  disabled={queuesLoading}
                >
                  <RefreshCw className={`mr-2 ${queuesLoading ? 'animate-spin' : ''}`} size={16} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQueues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {queuesLoading ? "Loading..." : "No customers in queue"}
                    </td>
                  </tr>
                ) : (
                  filteredQueues.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${entry.position === 1 ? 'bg-primary-custom' : 'bg-gray-400'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            {entry.position}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                          <div className="text-sm text-gray-500">{entry.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurantDisplayNames[entry.restaurant] || entry.restaurant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.partySize}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(entry.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {entry.status === "Waiting" && (
                          <Button
                            size="sm"
                            onClick={() => handleSeatCustomer(entry.id)}
                            className="text-accent-custom hover:text-green-600 p-1"
                            variant="ghost"
                            disabled={updateQueueMutation.isPending}
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary-custom hover:text-orange-600 p-1"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRemoveCustomer(entry.id)}
                          className="text-error-custom hover:text-red-600 p-1"
                          variant="ghost"
                          disabled={removeFromQueueMutation.isPending}
                        >
                          <X size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredQueues.length} entries
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
