// Production Payment Configuration for HOPE AI
// This file contains all production-ready payment settings and validation

export interface ProductionPaymentConfig {
  // Paystack Configuration
  paystack: {
    publicKey: string;
    secretKey: string;
    monthlyPlanCode: string;
    annualPlanCode: string;
    webhookSecret: string;
  };
  
  // Backend Configuration
  backend: {
    apiUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  
  // Security Configuration
  security: {
    webhookVerification: boolean;
    paymentValidation: boolean;
    fraudDetection: boolean;
  };
  
  // Feature Flags
  features: {
    enablePayments: boolean;
    enableSubscriptions: boolean;
    enableWebhooks: boolean;
    enableAnalytics: boolean;
  };
  
  // Monitoring & Logging
  monitoring: {
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
}

export const productionConfig: ProductionPaymentConfig = {
  paystack: {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    monthlyPlanCode: process.env.PAYSTACK_MONTHLY_PLAN_CODE || 'PLN_monthly_plan_live',
    annualPlanCode: process.env.PAYSTACK_ANNUAL_PLAN_CODE || 'PLN_annual_plan_live',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  },
  
  backend: {
    apiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  security: {
    webhookVerification: process.env.NODE_ENV === 'production',
    paymentValidation: true,
    fraudDetection: true,
  },
  
  features: {
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
    enableSubscriptions: true,
    enableWebhooks: process.env.NODE_ENV === 'production',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  
  monitoring: {
    enableLogging: process.env.NODE_ENV === 'production',
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableMetrics: true,
  },
};

// Validation function to ensure all required environment variables are set
export function validateProductionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Skip validation during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview') {
    return {
      isValid: true,
      errors: []
    };
  }
  
  // Check Paystack configuration
  if (!productionConfig.paystack.publicKey) {
    errors.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is required');
  }
  
  if (!productionConfig.paystack.secretKey) {
    errors.push('PAYSTACK_SECRET_KEY is required');
  }
  
  if (!productionConfig.paystack.webhookSecret && productionConfig.security.webhookVerification) {
    errors.push('PAYSTACK_WEBHOOK_SECRET is required for production');
  }
  
  // Check backend configuration
  if (!productionConfig.backend.apiUrl) {
    errors.push('BACKEND_API_URL is required');
  }
  
  // Check authentication
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required');
  }
  
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  }
  
  // Check database
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Production-ready error handling
export class ProductionPaymentError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  
  constructor(
    message: string,
    code: string = 'PAYMENT_ERROR',
    statusCode: number = 500,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ProductionPaymentError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
  }
}

// Production logging utility
export function logPaymentEvent(
  event: string,
  data: any,
  level: 'info' | 'warn' | 'error' = 'info'
) {
  if (!productionConfig.monitoring.enableLogging) return;
  
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    level,
    data: {
      ...data,
      // Remove sensitive data in production
      ...(productionConfig.monitoring.logLevel === 'info' && {
        // Sanitize sensitive fields
        email: data.email ? `${data.email.split('@')[0]}@***` : undefined,
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
      }),
    },
  };
  
  console[level](`[PAYMENT] ${event}:`, logData);
}

// Production-ready retry mechanism
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = productionConfig.backend.retryAttempts,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        logPaymentEvent('RETRY_EXHAUSTED', {
          attempts: maxAttempts,
          error: lastError.message,
        }, 'error');
        throw lastError;
      }
      
      logPaymentEvent('RETRY_ATTEMPT', {
        attempt,
        maxAttempts,
        error: lastError.message,
        nextRetryIn: delay * attempt,
      }, 'warn');
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}