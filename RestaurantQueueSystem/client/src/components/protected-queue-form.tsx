import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Info, Shield } from "lucide-react";
import { insertQueueEntrySchema, type InsertQueueEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

const restaurants = [
  { value: "bella-vista", label: "Bella Vista Italian" },
  { value: "sakura-sushi", label: "Sakura Sushi" },
  { value: "prime-steakhouse", label: "Prime Steakhouse" },
  { value: "garden-bistro", label: "Garden Bistro" },
];

const partySizes = [
  { value: "1", label: "1 person" },
  { value: "2", label: "2 people" },
  { value: "3", label: "3 people" },
  { value: "4", label: "4 people" },
  { value: "5", label: "5 people" },
  { value: "6", label: "6+ people" },
];

export default function ProtectedQueueForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedPartySize, setSelectedPartySize] = useState("");

  const form = useForm<InsertQueueEntry>({
    resolver: zodResolver(insertQueueEntrySchema),
    defaultValues: {
      name: "",
      email: "",
      restaurant: "",
      partySize: 1,
      joinTime: new Date(),
    },
  });

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (user) {
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.email || "";
      
      form.setValue("name", displayName);
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  const joinQueueMutation = useMutation({
    mutationFn: async (data: InsertQueueEntry) => {
      const response = await apiRequest("POST", "/api/queue", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Successfully joined queue!",
        description: `You're position #${data.queue_position} with an estimated wait of ${data.estimated_wait}.`,
      });
      form.reset();
      setSelectedRestaurant("");
      setSelectedPartySize("");
      
      // Re-populate user data after reset
      if (user) {
        const displayName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.email || "";
        form.setValue("name", displayName);
        form.setValue("email", user.email || "");
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Failed to join queue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertQueueEntry) => {
    const submitData = {
      ...data,
      partySize: parseInt(selectedPartySize),
      restaurant: selectedRestaurant,
      joinTime: new Date(),
    };
    joinQueueMutation.mutate(submitData);
  };

  if (!isAuthenticated) {
    return (
      <section id="customer" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-gray-100">
            <CardContent className="p-8 text-center">
              <Shield className="mx-auto text-primary-custom mb-4" size={48} />
              <h3 className="text-2xl font-bold text-secondary-custom mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in to join restaurant queues and manage your reservations.
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

  return (
    <section id="customer" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">Join Restaurant Queue</h2>
          <p className="text-gray-600 text-lg">Welcome back, {user?.firstName || 'there'}! Fill out the form below to join a restaurant's waiting list</p>
        </div>

        <Card className="shadow-xl border-gray-100">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-custom focus:border-transparent transition-all"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</Label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-custom focus:border-transparent transition-all bg-gray-50"
                    readOnly
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant</Label>
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant} required>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-custom focus:border-transparent transition-all">
                      <SelectValue placeholder="Select Restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.value} value={restaurant.value}>
                          {restaurant.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Party Size</Label>
                  <Select value={selectedPartySize} onValueChange={setSelectedPartySize} required>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-custom focus:border-transparent transition-all">
                      <SelectValue placeholder="Select party size" />
                    </SelectTrigger>
                    <SelectContent>
                      {partySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Info className="text-info-custom mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800">How it works:</h4>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• You'll receive an email confirmation with your queue position</li>
                      <li>• Estimated wait time is calculated automatically</li>
                      <li>• You'll get updates as your turn approaches</li>
                      <li>• Arrive 5 minutes before your estimated time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={joinQueueMutation.isPending || !selectedRestaurant || !selectedPartySize}
                className="w-full bg-primary-custom text-white py-4 rounded-xl hover:bg-orange-600 transition-all font-semibold text-lg shadow-lg h-auto"
              >
                <PlusCircle className="mr-2" size={20} />
                {joinQueueMutation.isPending ? "Joining Queue..." : "Join Queue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}