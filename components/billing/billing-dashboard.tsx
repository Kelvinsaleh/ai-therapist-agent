"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  Settings,
  Crown,
  TrendingUp,
  Users
} from "lucide-react";
import { paystackService, SubscriptionStatus, PaymentPlan } from "@/lib/payments/paystack-service";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { format } from "date-fns";

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  date: string;
  description: string;
  reference: string;
}

interface BillingStats {
  totalSpent: number;
  activeSubscriptions: number;
  nextBillingDate: string | null;
  averageMonthlySpend: number;
}

export function BillingDashboard() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user, isAuthenticated } = useSession();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBillingData();
    }
  }, [isAuthenticated, user]);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      
      // Load subscription status
      const status = await paystackService.getSubscriptionStatus(user?._id || '');
      setSubscriptionStatus(status);

      // Load billing history (mock data for now - replace with actual API call)
      const mockHistory: BillingHistory[] = [
        {
          id: '1',
          amount: 7.99,
          currency: 'USD',
          status: 'success',
          date: '2024-01-15',
          description: 'Monthly Premium Subscription',
          reference: 'TXN_123456789'
        },
        {
          id: '2',
          amount: 7.99,
          currency: 'USD',
          status: 'success',
          date: '2023-12-15',
          description: 'Monthly Premium Subscription',
          reference: 'TXN_123456788'
        },
        {
          id: '3',
          amount: 7.99,
          currency: 'USD',
          status: 'success',
          date: '2023-11-15',
          description: 'Monthly Premium Subscription',
          reference: 'TXN_123456787'
        }
      ];
      setBillingHistory(mockHistory);

      // Calculate billing stats
      const stats: BillingStats = {
        totalSpent: mockHistory.reduce((sum, item) => sum + item.amount, 0),
        activeSubscriptions: status.isActive ? 1 : 0,
        nextBillingDate: status.nextBillingDate?.toISOString() || null,
        averageMonthlySpend: mockHistory.length > 0 ? mockHistory.reduce((sum, item) => sum + item.amount, 0) / mockHistory.length : 0
      };
      setBillingStats(stats);

    } catch (error) {
      console.error("Error loading billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (reference: string) => {
    try {
      setIsDownloading(true);
      
      // In a real implementation, this would generate and download an invoice
      toast.success("Invoice download started");
      
      // Simulate download
      setTimeout(() => {
        setIsDownloading(false);
        toast.success("Invoice downloaded successfully");
      }, 2000);
      
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
      setIsDownloading(false);
    }
  };

  const handleUpgradePlan = () => {
    // Redirect to pricing page
    window.location.href = '/pricing';
  };

  const handleManageSubscription = () => {
    // In a real implementation, this would open a subscription management modal
    toast.info("Subscription management coming soon");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sign in to view your billing information
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscription and view billing history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManageSubscription}>
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
          {!subscriptionStatus?.isActive && (
            <Button onClick={handleUpgradePlan}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${billingStats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">{billingStats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-lg font-semibold">
                    {billingStats.nextBillingDate 
                      ? format(new Date(billingStats.nextBillingDate), 'MMM dd')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly</p>
                  <p className="text-2xl font-bold">${billingStats.averageMonthlySpend.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionStatus?.isActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{subscriptionStatus.plan?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${subscriptionStatus.plan?.price}/{subscriptionStatus.plan?.interval === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </Badge>
              </div>
              
              {subscriptionStatus.nextBillingDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Next billing: {format(subscriptionStatus.nextBillingDate, 'MMMM dd, yyyy')}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4" />
                Auto-renew: {subscriptionStatus.autoRenew ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to premium to unlock all features
              </p>
              <Button onClick={handleUpgradePlan}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.date), 'MMM dd, yyyy')} • {item.reference}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">${item.amount.toFixed(2)}</p>
                      <Badge variant={getStatusColor(item.status) as any} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(item.reference)}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you make a payment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}