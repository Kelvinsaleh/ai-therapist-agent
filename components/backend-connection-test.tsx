"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { backendService } from "@/lib/api/backend-service";

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
  lastChecked?: Date;
  backendUrl?: string;
}

export default function BackendConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const isConnected = await backendService.testConnection();
      setStatus({
        isConnected,
        isLoading: false,
        lastChecked: new Date(),
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL,
        error: isConnected ? undefined : 'Backend not responding'
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        lastChecked: new Date(),
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : status.isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          Backend Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={status.isConnected ? "default" : "destructive"}>
            {status.isConnected ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Disconnected
              </div>
            )}
          </Badge>
        </div>

        {status.backendUrl && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Backend URL:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {status.backendUrl}
            </code>
          </div>
        )}

        {status.lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last checked:</span>
            <span className="text-xs text-muted-foreground">
              {status.lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}

        {status.error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {status.error}
            </p>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={status.isLoading}
          className="w-full"
          variant="outline"
        >
          {status.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Next Steps:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Ensure your backend is running</li>
            <li>Check the backend URL in .env.local</li>
            <li>Verify CORS settings in backend</li>
            <li>Check network connectivity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
