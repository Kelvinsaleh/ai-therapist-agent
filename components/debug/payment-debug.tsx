"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bug, 
  ChevronDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  Copy
} from "lucide-react";
import { paystackService } from "@/lib/payments/paystack-service";
import { testPaymentService } from "@/lib/payments/test-payment";
import { toast } from "sonner";

export function PaymentDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      const info = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          enableTestPayments: process.env.NEXT_PUBLIC_ENABLE_TEST_PAYMENTS,
        },
        paystack: {
          configured: paystackService.isConfigured(),
          publicKey: paystackService.getPublicKey() ? 'Set' : 'Not Set',
          hasSecretKey: !!process.env.PAYSTACK_SECRET_KEY,
        },
        testMode: {
          enabled: testPaymentService.isEnabled(),
          statusMessage: testPaymentService.getStatusMessage(),
        },
        backend: {
          url: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Not Set',
          accessible: false, // Will be tested
        },
        user: {
          authenticated: false, // Will be set by parent component
          hasEmail: false,
          hasUserId: false,
        }
      };

      // Test backend connectivity
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/health`, {
          method: 'GET',
          timeout: 5000,
        });
        info.backend.accessible = response.ok;
      } catch (error) {
        info.backend.accessible = false;
        info.backend.error = error instanceof Error ? error.message : 'Unknown error';
      }

      setDebugInfo(info);
      toast.success("Diagnostics completed");
    } catch (error) {
      toast.error("Failed to run diagnostics");
      console.error("Diagnostics error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Payment Debug Panel
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={runDiagnostics} 
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? "Running..." : "Run Diagnostics"}
              </Button>
              <Button 
                onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2))}
                variant="outline"
                size="sm"
                disabled={!debugInfo}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>

            {debugInfo && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-semibold mb-2">Configuration Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Paystack Configured:</span>
                      {getStatusBadge(debugInfo.paystack.configured, debugInfo.paystack.configured ? 'Yes' : 'No')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Public Key:</span>
                      {getStatusBadge(debugInfo.paystack.publicKey === 'Set', debugInfo.paystack.publicKey)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Secret Key:</span>
                      {getStatusBadge(debugInfo.paystack.hasSecretKey, debugInfo.paystack.hasSecretKey ? 'Set' : 'Not Set')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Backend Accessible:</span>
                      {getStatusBadge(debugInfo.backend.accessible, debugInfo.backend.accessible ? 'Yes' : 'No')}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Test Mode:</span>
                      {getStatusBadge(debugInfo.testMode.enabled, debugInfo.testMode.enabled ? 'Enabled' : 'Disabled')}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Environment</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>NODE_ENV: {debugInfo.environment.nodeEnv}</div>
                    <div>Test Payments: {debugInfo.environment.enableTestPayments || 'Not Set'}</div>
                    <div>Backend URL: {debugInfo.backend.url}</div>
                  </div>
                </div>

                {debugInfo.backend.error && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Backend Error</h4>
                    <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                      {debugInfo.backend.error}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span className="text-xs">
                      {debugInfo.testMode.statusMessage}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://dashboard.paystack.com', '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Paystack
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/api/payments/verify', '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Verify API
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}