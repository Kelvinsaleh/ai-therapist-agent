"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Heart, Sparkles } from "lucide-react";
import { paystackService } from "@/lib/payments/paystack-service";
import { toast } from "sonner";
import { useSession } from "@/lib/contexts/session-context";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !trxref) {
        toast.error("No payment reference found");
        router.push("/pricing");
        return;
      }

      const paymentRef = reference || trxref;
      
      try {
        if (!paymentRef) {
          toast.error("No payment reference found");
          router.push("/pricing");
          return;
        }
        const result = await paystackService.verifyPayment(paymentRef);
        
        if (result.success) {
          setVerificationResult(result);
          toast.success("Payment verified successfully!");
          
          // Update user subscription status in backend
          try {
            const { backendService } = await import("@/lib/api/backend-service");
            if (paymentRef) {
              await backendService.verifyPayment(paymentRef as string);
            }
          } catch (error) {
            console.error('Error updating subscription:', error);
          }
        } else {
          toast.error(result.error || "Payment verification failed");
          router.push("/pricing");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Something went wrong. Please contact support.");
        router.push("/pricing");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [reference, trxref, router, user]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Verifying your payment...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your subscription</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Welcome to HOPE Premium! Your subscription is now active.
              </p>
              <p className="text-sm text-muted-foreground">
                You now have access to all premium features including unlimited AI therapy sessions, advanced insights, and priority support.
              </p>
            </div>

            {verificationResult?.reference && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Payment Reference:</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {verificationResult.reference}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <a href="/dashboard">
                  <Heart className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/therapy/memory-enhanced">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start AI Therapy
                </a>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                What's next? Explore your new premium features:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-primary/5 rounded">
                  <p className="font-medium">Unlimited Sessions</p>
                </div>
                <div className="p-2 bg-primary/5 rounded">
                  <p className="font-medium">Advanced Insights</p>
                </div>
                <div className="p-2 bg-primary/5 rounded">
                  <p className="font-medium">Priority Support</p>
                </div>
                <div className="p-2 bg-primary/5 rounded">
                  <p className="font-medium">Premium Content</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                A confirmation email has been sent to <strong>{user?.email}</strong>
              </p>
              <p className="mt-1">
                Need help? Contact our support team anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
