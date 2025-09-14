import { Request, Response } from "express";
import { Subscription, Payment } from "../models/Subscription";
import { User } from "../models/User";
import { PaystackService } from "../services/paystackService";
import { Types } from "mongoose";
import { logger } from "../utils/logger";

// Get subscription plans
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = PaystackService.getPlans();
    
    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    logger.error("Error fetching plans:", error);
    res.status(500).json({
      error: "Failed to fetch plans",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get user subscription status
export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user.id);
    
    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!subscription) {
      return res.json({
        success: true,
        subscription: {
          planType: "free",
          status: "active",
          features: PaystackService.getPlans()[0].features,
          endDate: null,
        },
      });
    }

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    logger.error("Error fetching subscription status:", error);
    res.status(500).json({
      error: "Failed to fetch subscription status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Initialize payment
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { planType } = req.body;
    const userId = new Types.ObjectId(req.user.id);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const plans = PaystackService.getPlans();
    const selectedPlan = plans.find(plan => plan.id === planType);
    
    if (!selectedPlan) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    if (selectedPlan.id === "free") {
      return res.status(400).json({ error: "Cannot pay for free plan" });
    }

    // Generate unique reference
    const reference = `HOPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      email: user.email,
      amount: selectedPlan.amount,
      plan: selectedPlan.planCode,
      reference,
      metadata: {
        userId: userId.toString(),
        planType,
        userName: user.name,
      },
    };

    const result = await PaystackService.initializePayment(paymentData);

    if (!result.status) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        authorizationUrl: result.data?.authorization_url,
        accessCode: result.data?.access_code,
        reference: result.data?.reference,
        amount: selectedPlan.amount,
        plan: selectedPlan,
      },
    });
  } catch (error) {
    logger.error("Error initializing payment:", error);
    res.status(500).json({
      error: "Failed to initialize payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Verify payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    // Verify payment with Paystack
    const verificationResult = await PaystackService.verifyPayment(reference);
    
    if (!verificationResult.status) {
      return res.status(400).json({ error: verificationResult.message });
    }

    const paymentData = verificationResult.data;
    
    // Check if payment was successful
    if (paymentData.status !== "success") {
      return res.status(400).json({ error: "Payment was not successful" });
    }

    // Get plan details
    const plans = PaystackService.getPlans();
    const planType = paymentData.metadata?.planType || "monthly";
    const selectedPlan = plans.find(plan => plan.id === planType);

    if (!selectedPlan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Create or update subscription
    const endDate = new Date();
    if (planType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = new Subscription({
      userId,
      planType,
      status: "active",
      paystackSubscriptionId: paymentData.reference,
      startDate: new Date(),
      endDate,
      nextBillingDate: planType !== "annual" ? endDate : undefined,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      features: {
        unlimitedChat: true,
        premiumMeditations: true,
        advancedAnalytics: true,
        prioritySupport: true,
        rescuePairs: true,
        customThemes: true,
        exportData: true,
        crisisSupport: true,
      },
    });

    await subscription.save();

    // Create payment record
    const payment = new Payment({
      userId,
      subscriptionId: subscription._id,
      paystackReference: reference,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      status: "success",
      paymentMethod: paymentData.channel || "card",
      description: `Payment for ${selectedPlan.name}`,
      metadata: paymentData,
    });

    await payment.save();

    res.json({
      success: true,
      message: "Payment verified and subscription activated successfully",
      subscription,
      payment,
    });
  } catch (error) {
    logger.error("Error verifying payment:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user.id);
    
    const subscription = await Subscription.findOne({ 
      userId, 
      status: "active" 
    });

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel with Paystack if it's a recurring subscription
    if (subscription.paystackSubscriptionId) {
      const cancelResult = await PaystackService.cancelSubscription(
        subscription.paystackSubscriptionId
      );
      
      if (!cancelResult.status) {
        logger.warn("Failed to cancel Paystack subscription:", cancelResult.message);
      }
    }

    // Update subscription status
    subscription.status = "cancelled";
    subscription.endDate = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    logger.error("Error cancelling subscription:", error);
    res.status(500).json({
      error: "Failed to cancel subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user.id);
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find({ userId })
      .populate("subscriptionId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalPayments: total,
        hasNextPage: skip + Number(limit) < total,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    logger.error("Error fetching payment history:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Check if user has access to premium feature
export const checkPremiumAccess = async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user.id);
    const { feature } = req.params;

    const subscription = await Subscription.findOne({ 
      userId, 
      status: "active",
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return res.json({
        success: true,
        hasAccess: false,
        message: "No active subscription",
      });
    }

    const hasAccess = subscription.features[feature as keyof typeof subscription.features] || false;

    res.json({
      success: true,
      hasAccess,
      subscription: {
        planType: subscription.planType,
        endDate: subscription.endDate,
        features: subscription.features,
      },
    });
  } catch (error) {
    logger.error("Error checking premium access:", error);
    res.status(500).json({
      error: "Failed to check premium access",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
