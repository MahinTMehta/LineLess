// Email utility functions for the frontend
export interface EmailTemplateData {
  name: string;
  restaurant: string;
  position?: number;
  eta?: string;
  partySize?: number;
  status?: string;
}

export const formatETA = (eta: Date): string => {
  return eta.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatWaitTime = (joinTime: Date, eta: Date): string => {
  const diffMs = eta.getTime() - joinTime.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  return `${diffMins} minutes`;
};

export const getRestaurantDisplayName = (restaurant: string): string => {
  const displayNames: Record<string, string> = {
    "bella-vista": "Bella Vista Italian",
    "sakura-sushi": "Sakura Sushi",
    "prime-steakhouse": "Prime Steakhouse",
    "garden-bistro": "Garden Bistro",
  };
  
  return displayNames[restaurant] || restaurant;
};
