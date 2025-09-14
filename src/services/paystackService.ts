import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_MONTHLY_PLAN_CODE = process.env.PAYSTACK_MONTHLY_PLAN_CODE;
const PAYSTACK_ANNUAL_PLAN_CODE = process.env.PAYSTACK_ANNUAL_PLAN_CODE;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "monthly" | "annual";
  features: string[];
  planCode: string;
}

export interface InitializePaymentData {
  email: string;
  amount: number;
  plan: string;
  reference?: string;
  metadata?: any;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

export class PaystackService {
  // Get available subscription plans
  static getPlans(): PaymentPlan[] {
    return [
      {
        id: "free",
        name: "Free Plan",
        description: "Basic features for getting started",
        amount: 0,
        currency: "NGN",
        interval: "monthly",
        features: [
          "5 therapy sessions per month",
          "Basic mood tracking",
          "Limited journal entries",
          "Community support",
        ],
        planCode: "",
      },
      {
        id: "monthly",
        name: "Monthly Premium",
        description: "Full access to all features",
        amount: 5000, // 5000 NGN
        currency: "NGN",
        interval: "monthly",
        features: [
          "Unlimited therapy sessions",
          "Premium meditations",
          "Advanced analytics",
          "Priority support",
          "Rescue pairs",
          "Custom themes",
          "Data export",
          "Crisis support",
        ],
        planCode: PAYSTACK_MONTHLY_PLAN_CODE || "",
      },
      {
        id: "annual",
        name: "Annual Premium",
        description: "Best value - Save 20%",
        amount: 48000, // 48,000 NGN (20% off)
        currency: "NGN",
        interval: "annual",
        features: [
          "Unlimited therapy sessions",
          "Premium meditations",
          "Advanced analytics",
          "Priority support",
          "Rescue pairs",
          "Custom themes",
          "Data export",
          "Crisis support",
          "Exclusive content",
        ],
        planCode: PAYSTACK_ANNUAL_PLAN_CODE || "",
      },
    ];
  }

  // Initialize payment
  static async initializePayment(data: InitializePaymentData): Promise<PaystackResponse> {
    try {
      const response = await paystack.post("/transaction/initialize", {
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        plan: data.plan,
        reference: data.reference,
        callback_url: `${FRONTEND_URL}/payment/success`,
        metadata: data.metadata,
      });

      return {
        status: true,
        message: "Payment initialized successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to initialize payment",
      };
    }
  }

  // Verify payment
  static async verifyPayment(reference: string): Promise<PaystackResponse> {
    try {
      const response = await paystack.get(`/transaction/verify/${reference}`);
      
      if (response.data.status) {
        return {
          status: true,
          message: "Payment verified successfully",
          data: response.data.data,
        };
      } else {
        return {
          status: false,
          message: "Payment verification failed",
        };
      }
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to verify payment",
      };
    }
  }

  // Create subscription
  static async createSubscription(
    customerEmail: string,
    planCode: string,
    authorizationCode: string
  ): Promise<PaystackResponse> {
    try {
      const response = await paystack.post("/subscription", {
        customer: customerEmail,
        plan: planCode,
        authorization: authorizationCode,
      });

      return {
        status: true,
        message: "Subscription created successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to create subscription",
      };
    }
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string): Promise<PaystackResponse> {
    try {
      const response = await paystack.get(`/subscription/${subscriptionId}`);
      
      return {
        status: true,
        message: "Subscription retrieved successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to get subscription",
      };
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string): Promise<PaystackResponse> {
    try {
      const response = await paystack.post(`/subscription/disable`, {
        code: subscriptionId,
        token: PAYSTACK_SECRET_KEY,
      });

      return {
        status: true,
        message: "Subscription cancelled successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to cancel subscription",
      };
    }
  }

  // Create customer
  static async createCustomer(email: string, firstName: string, lastName: string): Promise<PaystackResponse> {
    try {
      const response = await paystack.post("/customer", {
        email,
        first_name: firstName,
        last_name: lastName,
      });

      return {
        status: true,
        message: "Customer created successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Failed to create customer",
      };
    }
  }

  // Get customer
  static async getCustomer(email: string): Promise<PaystackResponse> {
    try {
      const response = await paystack.get(`/customer/${email}`);
      
      return {
        status: true,
        message: "Customer retrieved successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.response?.data?.message || "Customer not found",
      };
    }
  }
}
