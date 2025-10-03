import { NextRequest, NextResponse } from 'next/server';
import { productionConfig, logPaymentEvent, ProductionPaymentError } from '@/lib/payments/production-config';
import crypto from 'crypto';

// Paystack webhook handler for production
export async function POST(req: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature in production
    if (productionConfig.security.webhookVerification && signature) {
      const isValid = verifyPaystackSignature(body, signature);
      if (!isValid) {
        logPaymentEvent('WEBHOOK_SIGNATURE_INVALID', {
          signature: signature.substring(0, 20) + '...',
        }, 'error');
        
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    
    logPaymentEvent('WEBHOOK_RECEIVED', {
      event: event.event,
      reference: event.data?.reference,
    });

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
        
      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;
        
      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data);
        break;
        
      default:
        logPaymentEvent('WEBHOOK_UNHANDLED_EVENT', {
          event: event.event,
        }, 'warn');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logPaymentEvent('WEBHOOK_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');

    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Verify Paystack webhook signature
function verifyPaystackSignature(payload: string, signature: string): boolean {
  try {
    const webhookSecret = productionConfig.paystack.webhookSecret;
    if (!webhookSecret) {
      logPaymentEvent('WEBHOOK_SECRET_MISSING', {}, 'error');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    logPaymentEvent('WEBHOOK_SIGNATURE_VERIFICATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');
    return false;
  }
}

// Handle successful payment
async function handleSuccessfulPayment(paymentData: any) {
  try {
    logPaymentEvent('PAYMENT_SUCCESS_WEBHOOK', {
      reference: paymentData.reference,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerEmail: paymentData.customer?.email,
    });

    // Update user subscription status in backend
    const response = await fetch(`${productionConfig.backend.apiUrl}/payments/webhook/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET_TOKEN || 'webhook-token'}`,
      },
      body: JSON.stringify({
        reference: paymentData.reference,
        amount: paymentData.amount,
        currency: paymentData.currency,
        customerEmail: paymentData.customer?.email,
        paidAt: paymentData.paid_at,
        metadata: paymentData.metadata,
      }),
    });

    if (!response.ok) {
      throw new ProductionPaymentError(
        `Failed to update subscription: ${response.status}`,
        'SUBSCRIPTION_UPDATE_FAILED',
        response.status
      );
    }

    logPaymentEvent('SUBSCRIPTION_UPDATED_SUCCESS', {
      reference: paymentData.reference,
    });

  } catch (error) {
    logPaymentEvent('PAYMENT_SUCCESS_HANDLING_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reference: paymentData.reference,
    }, 'error');
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscriptionData: any) {
  try {
    logPaymentEvent('SUBSCRIPTION_CREATED_WEBHOOK', {
      subscriptionCode: subscriptionData.subscription_code,
      customerEmail: subscriptionData.customer?.email,
      planCode: subscriptionData.plan?.plan_code,
    });

    // Update user subscription in backend
    const response = await fetch(`${productionConfig.backend.apiUrl}/payments/webhook/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET_TOKEN || 'webhook-token'}`,
      },
      body: JSON.stringify({
        subscriptionCode: subscriptionData.subscription_code,
        customerEmail: subscriptionData.customer?.email,
        planCode: subscriptionData.plan?.plan_code,
        status: subscriptionData.status,
        createdAt: subscriptionData.created_at,
      }),
    });

    if (!response.ok) {
      throw new ProductionPaymentError(
        `Failed to create subscription: ${response.status}`,
        'SUBSCRIPTION_CREATION_FAILED',
        response.status
      );
    }

  } catch (error) {
    logPaymentEvent('SUBSCRIPTION_CREATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionCode: subscriptionData.subscription_code,
    }, 'error');
  }
}

// Handle subscription disabled
async function handleSubscriptionDisabled(subscriptionData: any) {
  try {
    logPaymentEvent('SUBSCRIPTION_DISABLED_WEBHOOK', {
      subscriptionCode: subscriptionData.subscription_code,
      customerEmail: subscriptionData.customer?.email,
    });

    // Update subscription status in backend
    const response = await fetch(`${productionConfig.backend.apiUrl}/payments/webhook/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET_TOKEN || 'webhook-token'}`,
      },
      body: JSON.stringify({
        subscriptionCode: subscriptionData.subscription_code,
        customerEmail: subscriptionData.customer?.email,
        disabledAt: subscriptionData.disabled_at,
      }),
    });

    if (!response.ok) {
      throw new ProductionPaymentError(
        `Failed to disable subscription: ${response.status}`,
        'SUBSCRIPTION_DISABLE_FAILED',
        response.status
      );
    }

  } catch (error) {
    logPaymentEvent('SUBSCRIPTION_DISABLE_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionCode: subscriptionData.subscription_code,
    }, 'error');
  }
}

// Handle payment failure
async function handlePaymentFailed(paymentData: any) {
  try {
    logPaymentEvent('PAYMENT_FAILED_WEBHOOK', {
      reference: paymentData.reference,
      customerEmail: paymentData.customer?.email,
      failureReason: paymentData.failure_reason,
    });

    // Notify user of payment failure
    const response = await fetch(`${productionConfig.backend.apiUrl}/payments/webhook/failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET_TOKEN || 'webhook-token'}`,
      },
      body: JSON.stringify({
        reference: paymentData.reference,
        customerEmail: paymentData.customer?.email,
        failureReason: paymentData.failure_reason,
        failedAt: paymentData.failed_at,
      }),
    });

    if (!response.ok) {
      throw new ProductionPaymentError(
        `Failed to handle payment failure: ${response.status}`,
        'PAYMENT_FAILURE_HANDLING_FAILED',
        response.status
      );
    }

  } catch (error) {
    logPaymentEvent('PAYMENT_FAILURE_HANDLING_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      reference: paymentData.reference,
    }, 'error');
  }
}