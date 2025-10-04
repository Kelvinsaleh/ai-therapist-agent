"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingDotsSmall } from "@/components/ui/loading-dots";
import { toast } from "sonner";

export default function TestBackendPage() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testBackend = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      // Test backend health
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();

      // Test backend login endpoint
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      const loginData = await loginResponse.json();

      // Test backend register endpoint
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123'
        })
      });
      const registerData = await registerResponse.json();

      setResults({
        health: {
          status: healthResponse.status,
          data: healthData
        },
        login: {
          status: loginResponse.status,
          data: loginData
        },
        register: {
          status: registerResponse.status,
          data: registerData
        },
        timestamp: new Date().toISOString()
      });

      toast.success("Backend test completed!");
    } catch (error) {
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      toast.error("Backend test failed");
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectBackend = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      // Test direct backend connection
      const response = await fetch('https://hope-backend-2.onrender.com/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      setResults({
        directBackend: {
          status: response.status,
          data: data,
          url: 'https://hope-backend-2.onrender.com/health'
        },
        timestamp: new Date().toISOString()
      });

      toast.success("Direct backend test completed!");
    } catch (error) {
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      toast.error("Direct backend test failed");
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
              🔧 Backend Connection Test
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Test your backend API connections and authentication
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testBackend} disabled={isLoading}>
                  {isLoading ? <LoadingDotsSmall /> : "Test Backend APIs"}
                </Button>
                <Button onClick={testDirectBackend} disabled={isLoading} variant="outline">
                  {isLoading ? <LoadingDotsSmall /> : "Test Direct Backend"}
                </Button>
              </div>
            </div>

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Results:</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-muted-foreground space-y-2">
              <p><strong>Backend URL:</strong> https://hope-backend-2.onrender.com</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click "Test Backend APIs" to test your frontend API routes</li>
                <li>Click "Test Direct Backend" to test direct backend connection</li>
                <li>Check the results to see what's working and what's not</li>
                <li>If backend is down, try the demo login feature</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}