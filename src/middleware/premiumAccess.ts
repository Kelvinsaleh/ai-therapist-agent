import { Request, Response, NextFunction } from "express";
import { Subscription } from "../models/Subscription";
import { Types } from "mongoose";

export const requirePremium = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new Types.ObjectId(req.user.id);
      
      const subscription = await Subscription.findOne({
        userId,
        status: "active",
        endDate: { $gt: new Date() }
      });

      if (!subscription) {
        return res.status(403).json({
          error: "Premium subscription required",
          message: "This feature requires a premium subscription",
          feature,
        });
      }

      const hasAccess = subscription.features[feature as keyof typeof subscription.features];
      
      if (!hasAccess) {
        return res.status(403).json({
          error: "Feature not available in your plan",
          message: `The ${feature} feature is not available in your current plan`,
          feature,
          subscription: {
            planType: subscription.planType,
            endDate: subscription.endDate,
          },
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      res.status(500).json({
        error: "Failed to check premium access",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};

// Extend Express Request type to include subscription
declare global {
  namespace Express {
    interface Request {
      subscription?: any;
    }
  }
}
