import { useState } from "react";
import { Copy, Code, Reply, Plug, Table, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocs() {
  const { toast } = useToast();
  const [webhookUrl] = useState("https://your-n8n.replit.app/webhook/tableq");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The URL has been copied to your clipboard.",
    });
  };

  const requestExample = `{
  "name": "John Doe",
  "email": "john.doe@email.com", 
  "restaurant": "bella-vista",
  "party_size": 4,
  "join_time": "2024-01-15T18:30:00Z"
}`;

  const responseExample = `{
  "success": true,
  "queue_position": 3,
  "estimated_wait": "45 minutes",
  "eta": "2024-01-15T19:15:00Z",
  "message": "Successfully added to queue"
}`;

  return (
    <section id="api-docs" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-custom mb-4">API Documentation</h2>
          <p className="text-gray-600 text-lg">n8n webhook integration guide for developers</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Webhook Configuration */}
          <Card className="shadow-lg border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-bold text-secondary-custom mb-6 flex items-center">
                <Plug className="text-primary-custom mr-3" size={24} />
                Webhook Configuration
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Webhook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={webhookUrl}
                      className="flex-1 font-mono text-sm bg-gray-50"
                      readOnly
                    />
                    <Button 
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="bg-primary-custom text-white hover:bg-orange-600"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Request Method</Label>
                  <Badge className="bg-accent-custom text-white">POST</Badge>
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Content-Type</Label>
                  <code className="block bg-gray-50 p-3 rounded-lg text-sm font-mono">application/json</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Format */}
          <Card className="shadow-lg border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-bold text-secondary-custom mb-6 flex items-center">
                <Code className="text-primary-custom mr-3" size={24} />
                Request Format
              </h3>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
                  <code>{requestExample}</code>
                </pre>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-info-custom rounded-full mt-2"></div>
                  <div className="text-sm text-gray-600">
                    <strong>join_time</strong> should be in ISO 8601 format (UTC)
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-info-custom rounded-full mt-2"></div>
                  <div className="text-sm text-gray-600">
                    <strong>ETA</strong> is automatically calculated as join_time + 45 minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card className="shadow-lg border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-bold text-secondary-custom mb-6 flex items-center">
                <Reply className="text-primary-custom mr-3" size={24} />
                Response Format
              </h3>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-blue-400 text-sm font-mono">
                  <code>{responseExample}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets Setup */}
          <Card className="shadow-lg border-gray-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-bold text-secondary-custom mb-6 flex items-center">
                <Table className="text-primary-custom mr-3" size={24} />
                Google Sheets Setup
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Sheet Name:</h4>
                  <code className="text-sm font-mono">TableQ_Data</code>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Tab Name:</h4>
                  <code className="text-sm font-mono">Queues</code>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Required Columns:</h4>
                  <div className="text-sm font-mono space-y-1">
                    <div>A: ID (auto-increment)</div>
                    <div>B: Restaurant</div>
                    <div>C: User Email</div>
                    <div>D: Party Size</div>
                    <div>E: Join Time</div>
                    <div>F: Status (default: "Waiting")</div>
                    <div>G: ETA</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="mt-12 shadow-lg border-gray-100">
          <CardContent className="p-8">
            <h3 className="text-2xl font-heading font-bold text-secondary-custom mb-6 flex items-center">
              <Cog className="text-primary-custom mr-3" size={28} />
              Setup Instructions
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-custom text-white rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                  <div className="text-2xl">☁️</div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">1. Deploy n8n</h4>
                <p className="text-sm text-gray-600">Set up n8n on Replit or your preferred platform</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-custom text-white rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                  <div className="text-2xl">🔑</div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">2. Configure APIs</h4>
                <p className="text-sm text-gray-600">Set up Google Sheets and email service credentials</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-info-custom text-white rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
                  <div className="text-2xl">▶️</div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">3. Test & Deploy</h4>
                <p className="text-sm text-gray-600">Import workflow and test with sample data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
