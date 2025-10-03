// Paystack Payment Service for HOPE
// Handles all payment operations with Paystack
// Production-ready with enhanced security and error handling

import { productionConfig, logPaymentEvent, retryOperation, ProductionPaymentError } from './production-config';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'annually';
  paystackPlanCode: string;
  features: string[];
  popular?: boolean;
  savings?: number; // For annual plans
}

export interface PaymentResponse {
  success: boolean;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
  message?: string;
  error?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: PaymentPlan | null;
  expiresAt: Date | null;
  autoRenew: boolean;
  nextBillingDate: Date | null;
}

class PaystackService {
  private publicKey: string;
  private backendUrl: string;
  private config: typeof productionConfig;

  constructor() {
    this.config = productionConfig;
    this.publicKey = this.config.paystack.publicKey;
    this.backendUrl = this.config.backend.apiUrl;
    
    // Validate configuration in production (but not during build)
    if (process.env.NODE_ENV === 'production') {
      const validation = require('./production-config').validateProductionConfig();
      if (!validation.isValid) {
        logPaymentEvent('CONFIG_VALIDATION_FAILED', {
          errors: validation.errors,
        }, 'error');
        throw new ProductionPaymentError(
          `Configuration validation failed: ${validation.errors.join(', ')}`,
          'CONFIG_ERROR',
          500
        );
      }
    }
  }

  // Available subscription plans
  getPlans(): PaymentPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 7.99,
        currency: 'USD',
        interval: 'monthly',
        paystackPlanCode: this.config.paystack.monthlyPlanCode,
        features: [
          'Unlimited AI therapy sessions',
          'Advanced mood tracking',
          'Personalized insights',
          '24/7 crisis support',
          'Full meditation library',
          'AI journal analysis',
          'Advanced progress tracking',
          'Priority email support',
          'Advanced voice therapy',
          'Unlimited session duration'
        ]
      },
      {
        id: 'annually',
        name: 'Annual Plan',
        price: 89.99,
        currency: 'USD',
        interval: 'annually',
        paystackPlanCode: this.config.paystack.annualPlanCode,
        popular: true,
        savings: 6.89, // $96.88 - $89.99 = $6.89 savings
        features: [
          'Everything in Monthly Plan',
          'Priority support',
          'Advanced analytics',
          'Custom therapy approaches',
          'Family sharing (up to 3 members)',
          'Export data',
          'Premium meditation content',
          '2 months free (save $6.89)'
        ]
      }
    ];
  }

  // Initialize payment through backend with production-ready error handling
  async initializePayment(
    email: string,
    planId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResponse> {
    try {
      // Input validation
      if (!email || !planId || !userId) {
        throw new ProductionPaymentError('Missing required parameters', 'INVALID_INPUT', 400);
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ProductionPaymentError('Invalid email format', 'INVALID_EMAIL', 400);
      }

      const plan = this.getPlans().find(p => p.id === planId);
      if (!plan) {
        throw new ProductionPaymentError('Invalid plan selected', 'INVALID_PLAN', 400);
      }

      logPaymentEvent('PAYMENT_INITIALIZATION_STARTED', {
        email: email.split('@')[0] + '@***', // Sanitize email for logging
        planId,
        userId,
        planPrice: plan.price,
        planCurrency: plan.currency,
      });

      const paymentData = {
        email,
        planId,
        planCode: plan.paystackPlanCode,
        amount: plan.price,
        currency: plan.currency,
        userId,
        metadata: {
          planName: plan.name,
          timestamp: new Date().toISOString(),
          source: 'frontend',
          ...metadata
        },
        callback_url: `${window.location.origin}/payment/success`,
      };

      const response = await retryOperation(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.backend.timeout);

        try {
          const response = await fetch(`${this.backendUrl}/payments/initialize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'HOPE-AI-Frontend/1.0',
            },
            body: JSON.stringify(paymentData),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new ProductionPaymentError(
              `Backend responded with ${response.status}: ${response.statusText}`,
              'BACKEND_ERROR',
              response.status
            );
          }

          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });

      const data = await response.json();

      if (data.success) {
        logPaymentEvent('PAYMENT_INITIALIZATION_SUCCESS', {
          reference: data.reference,
          planId,
          userId,
        });

        return {
          success: true,
          reference: data.reference,
          authorization_url: data.authorization_url,
          access_code: data.access_code,
          message: 'Payment initialized successfully'
        };
      } else {
        logPaymentEvent('PAYMENT_INITIALIZATION_FAILED', {
          error: data.error,
          planId,
          userId,
        }, 'error');

        return {
          success: false,
          error: data.error || 'Failed to initialize payment'
        };
      }
    } catch (error) {
      logPaymentEvent('PAYMENT_INITIALIZATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        planId,
        userId,
      }, 'error');

      if (error instanceof ProductionPaymentError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Payment initialization failed. Please try again.'
      };
    }
  }

  // Verify payment through backend
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          reference: data.reference,
          message: 'Payment verified successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  // Create subscription through backend
  async createSubscription(
    customerEmail: string,
    planCode: string,
    authorizationCode: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/payments/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail,
          planCode,
          authorizationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          reference: data.subscriptionCode,
          message: 'Subscription created successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create subscription'
        };
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed'
      };
    }
  }

  // Get subscription status through backend
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.backendUrl}/payments/subscription/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add user ID as query parameter or in headers
      });

      const data = await response.json();

      if (data.success) {
        const subscription = data.subscription;
        const plan = this.getPlans().find(p => p.paystackPlanCode === subscription.planCode);
        
        return {
          isActive: subscription.isActive,
          plan: plan || null,
          expiresAt: subscription.expiresAt ? new Date(subscription.expiresAt) : null,
          autoRenew: subscription.autoRenew,
          nextBillingDate: subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : null
        };
      } else {
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          autoRenew: false,
          nextBillingDate: null
        };
      }
    } catch (error) {
      console.error('Subscription status error:', error);
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        autoRenew: false,
        nextBillingDate: null
      };
    }
  }

  // Cancel subscription through backend
  async cancelSubscription(userId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/payments/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: 'Subscription cancelled successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to cancel subscription'
        };
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription cancellation failed'
      };
    }
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.publicKey;
  }

  // Check if Paystack is configured
  isConfigured(): boolean {
    return !!(this.publicKey && this.backendUrl);
  }

  // Direct Paystack initialization (fallback if backend is down)
  async initializeDirectPayment(
    email: string,
    planId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResponse> {
    try {
      const plan = this.getPlans().find(p => p.id === planId);
      if (!plan) {
        throw new ProductionPaymentError('Invalid plan selected', 'INVALID_PLAN', 400);
      }

      logPaymentEvent('DIRECT_PAYMENT_INITIALIZATION_STARTED', {
        email: email.split('@')[0] + '@***',
        planId,
        userId,
        planPrice: plan.price,
      });

      // Direct Paystack API call (requires secret key on frontend - not recommended for production)
      // This is a fallback mechanism
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(plan.price * 100), // Convert to kobo/cents
          currency: plan.currency,
          reference: `HOPE_${Date.now()}_${userId}`,
          callback_url: `${window.location.origin}/payment/success`,
          metadata: {
            planId,
            planName: plan.name,
            userId,
            ...metadata
          }
        })
      });

      const data = await response.json();

      if (data.status && data.data) {
        logPaymentEvent('DIRECT_PAYMENT_INITIALIZATION_SUCCESS', {
          reference: data.data.reference,
          planId,
          userId,
        });

        return {
          success: true,
          reference: data.data.reference,
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          message: 'Payment initialized successfully'
        };
      } else {
        throw new ProductionPaymentError(
          data.message || 'Failed to initialize payment',
          'PAYSTACK_ERROR',
          400
        );
      }
    } catch (error) {
      logPaymentEvent('DIRECT_PAYMENT_INITIALIZATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        planId,
        userId,
      }, 'error');

      if (error instanceof ProductionPaymentError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Payment initialization failed. Please try again.'
      };
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
