"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Heart, Shield, Users, Crown, Video, MessageSquare, Clock, AlertTriangle, Lock } from "lucide-react";
import { paystackService, PaymentPlan } from "@/lib/payments/paystack-service";
import { testPaymentService } from "@/lib/payments/test-payment";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { feedback } from "@/lib/utils/feedback";
import { PaymentDebugPanel } from "@/components/debug/payment-debug";

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      await feedback.error();
      toast.error("Please sign in to subscribe");
      router.push("/login");
      return;
    }

    // Validate user data
    if (!user?.email || !user?._id) {
      toast.error("User information is incomplete. Please sign in again.");
      router.push("/login");
      return;
    }

    setIsLoading(planId);
    await feedback.buttonClick();
    
    // Enhanced loading feedback
    toast.loading("🔄 Initializing secure payment...");
    
    try {
      console.log("Starting payment initialization:", {
        email: user.email,
        planId,
        userId: user._id,
        paystackConfigured: paystackService.isConfigured()
      });

      // Check if Paystack is properly configured
      if (!paystackService.isConfigured()) {
        throw new Error("Payment system is not properly configured. Please contact support.");
      }

      let result = await paystackService.initializePayment(
        user.email,
        planId,
        user._id,
        {
          source: 'pricing_page',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: window.location.href
        }
      );

      console.log("Payment initialization result:", result);

      // If backend payment fails, try direct Paystack initialization as fallback
      if (!result.success && result.error?.includes('Backend')) {
        console.log("Backend payment failed, trying direct Paystack initialization...");
        toast.loading("🔄 Trying alternative payment method...");
        
        result = await paystackService.initializeDirectPayment(
          user.email,
          planId,
          user._id,
          {
            source: 'pricing_page_fallback',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: window.location.href
          }
        );
        
        console.log("Direct payment initialization result:", result);
      }

      // If direct Paystack also fails, try test mode (development only)
      if (!result.success && testPaymentService.isEnabled()) {
        console.log("Direct payment failed, trying test mode...");
        toast.loading("🧪 Initializing test payment...");
        
        const testResult = await testPaymentService.initializeTestPayment(
          user.email,
          planId,
          user._id,
          {
            source: 'pricing_page_test',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: window.location.href
          }
        );
        
        if (testResult.success) {
          result = testResult;
          toast.info("🧪 Test Payment Mode - This is a simulated payment for development");
        }
        
        console.log("Test payment initialization result:", testResult);
      }

      if (result.success && result.authorization_url) {
        // Success feedback before redirect
        await feedback.success();
        toast.success("✅ Payment initialized! Redirecting to secure payment...", { 
          duration: 2000 
        });
        
        // Immediate redirect to payment page
        console.log("Redirecting to payment URL:", result.authorization_url);
        window.location.href = result.authorization_url;
      } else {
        await feedback.error();
        console.error("Payment initialization failed:", result);
        toast.error(result.error || "Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      await feedback.error();
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          toast.error("Network error. Please check your connection and try again.");
        } else if (error.message.includes("configured")) {
          toast.error("Payment system configuration error. Please contact support.");
        } else {
          toast.error(`Payment error: ${error.message}`);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsLoading(null);
      }, 1000);
    }
  };

  const handleSignIn = async () => {
    await feedback.buttonClick();
    router.push("/login");
  };

  const freePlanFeatures = [
    "1 active match",
    "Basic text chat",
    "Weekly check-ins",
    "Community support groups"
  ];

  const premiumPlanFeatures = [
    "Unlimited matches",
    "Video calls",
    "Advanced matching filters",
    "Priority matching",
    "Daily check-ins",
    "Crisis support priority"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Find Your Support Match
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Connect with others who understand your journey and can provide mutual support on your mental health path
          </p>

          {/* Payment Mode Indicator */}
          {testPaymentService.isEnabled() && (
            <div className="mb-6">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                🧪 {testPaymentService.getStatusMessage()}
              </Badge>
            </div>
          )}

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Peer Support</h3>
              <p className="text-sm text-muted-foreground">Connect with others who share similar experiences and challenges</p>
            </div>
            <div className="text-center">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Safe & Secure</h3>
              <p className="text-sm text-muted-foreground">All interactions are moderated and safety-checked for your protection</p>
            </div>
            <div className="text-center">
              <div className="p-3 rounded-full bg-primary/10 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">AI-powered matching based on compatibility, goals, and communication style</p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Card className="h-full border-border">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-muted w-12 h-12 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                <Badge variant="secondary" className="mx-auto mt-2">Current</Badge>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {freePlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 opacity-50">
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground line-through">Video calls</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-50">
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground line-through">Advanced filters</span>
                  </li>
                </ul>

                <Button
                  onClick={handleSignIn}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  size="lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Sign in to find your support match
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Connect with others who understand your journey and can provide mutual support.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <Card className="h-full border-primary shadow-lg scale-105">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Premium Plan</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$7.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {premiumPlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe('monthly')}
                  disabled={isLoading === 'monthly'}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {isLoading === 'monthly' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime. No hidden fees.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Safety & Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20"
        >
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Safety */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Safety & Privacy
              </h2>
              <h3 className="text-lg font-semibold mb-4">Your Safety is Our Priority</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  All profiles are verified and safety-checked
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  AI content moderation for all messages
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Easy report and block functionality
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Emergency escalation to crisis support
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Session time limits for healthy boundaries
                </li>
              </ul>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-semibold mb-4 mt-8 md:mt-12">Privacy Protection</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  End-to-end encrypted messaging
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  No personal data shared without consent
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Anonymous matching options available
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  GDPR compliant data handling
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  You control what information to share
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Find Your Support Match?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of people who have found meaningful connections and support through our platform.
              </p>
              <Button 
                onClick={handleSignIn}
                size="lg" 
                className="bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                Get Started Today
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Debug Panel for Development */}
      <PaymentDebugPanel />
    </div>
  );
}
