import express from "express";
import {
  getPlans,
  getSubscriptionStatus,
  initializePayment,
  verifyPayment,
  cancelSubscription,
  getPaymentHistory,
  checkPremiumAccess,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/plans", getPlans);

// Protected routes
router.use(authenticateToken);

router.get("/status", getSubscriptionStatus);
router.post("/initialize-payment", initializePayment);
router.get("/verify-payment/:reference", verifyPayment);
router.post("/cancel", cancelSubscription);
router.get("/payments", getPaymentHistory);
router.get("/check-access/:feature", checkPremiumAccess);

export default router;
