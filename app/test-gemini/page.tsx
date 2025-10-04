"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingDotsSmall } from "@/components/ui/loading-dots";
import { toast } from "sonner";

export default function TestGeminiPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testGemini = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode: 'therapy'
        })
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response || data.message || data.content);
        toast.success("Gemini response received!");
      } else {
        setResponse(`Error: ${data.error}`);
        toast.error("Failed to get Gemini response");
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Failed to connect to Gemini");
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/gemini');
      const data = await res.json();
      
      if (data.success) {
        toast.success("Gemini API connection successful!");
      } else {
        toast.error("Gemini API connection failed");
      }
    } catch (error) {
      toast.error("Failed to test Gemini connection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🤖 Gemini AI Test Page
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Test your Google Gemini AI integration
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testConnection} disabled={isLoading}>
                  {isLoading ? <LoadingDotsSmall /> : "Test Connection"}
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Message:</label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a message to test Gemini AI..."
                  onKeyPress={(e) => e.key === 'Enter' && testGemini()}
                />
              </div>
              
              <Button 
                onClick={testGemini} 
                disabled={isLoading || !message.trim()}
                className="w-full"
              >
                {isLoading ? <LoadingDotsSmall text="Testing Gemini..." /> : "Send to Gemini"}
              </Button>
            </div>

            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gemini Response:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">
                    {response}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-muted-foreground space-y-2">
              <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY ? "✅ Configured" : "❌ Not configured"}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Make sure GOOGLE_GEMINI_API_KEY is set in your .env.local file</li>
                <li>Test the connection first to verify API key is working</li>
                <li>Try sending a therapy-related message to test the AI responses</li>
                <li>Check browser console for any error messages</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}