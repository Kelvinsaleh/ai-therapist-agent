// Test Payment Service for Development
// This provides a mock payment flow for testing when backend is not available

export interface TestPaymentResponse {
  success: boolean;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
  message?: string;
  error?: string;
}

export class TestPaymentService {
  private isTestMode: boolean;

  constructor() {
    this.isTestMode = process.env.NODE_ENV === 'development' || 
                     process.env.NEXT_PUBLIC_ENABLE_TEST_PAYMENTS === 'true';
  }

  // Mock payment initialization for testing
  async initializeTestPayment(
    email: string,
    planId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<TestPaymentResponse> {
    if (!this.isTestMode) {
      return {
        success: false,
        error: 'Test payment mode is not enabled'
      };
    }

    console.log('🧪 Test Payment Mode - Initializing mock payment:', {
      email: email.split('@')[0] + '@***',
      planId,
      userId,
      metadata
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock payment data
    const reference = `TEST_${Date.now()}_${userId}`;
    const mockAuthorizationUrl = `https://checkout.paystack.com/test/${reference}`;

    return {
      success: true,
      reference,
      authorization_url: mockAuthorizationUrl,
      access_code: `test_access_${Date.now()}`,
      message: 'Test payment initialized successfully'
    };
  }

  // Mock payment verification for testing
  async verifyTestPayment(reference: string): Promise<TestPaymentResponse> {
    if (!this.isTestMode) {
      return {
        success: false,
        error: 'Test payment mode is not enabled'
      };
    }

    console.log('🧪 Test Payment Mode - Verifying mock payment:', reference);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful verification
    return {
      success: true,
      reference,
      message: 'Test payment verified successfully'
    };
  }

  // Check if test mode is enabled
  isEnabled(): boolean {
    return this.isTestMode;
  }

  // Get test mode status message
  getStatusMessage(): string {
    if (this.isTestMode) {
      return '🧪 Test Payment Mode Active - Payments will be simulated';
    }
    return 'Production Payment Mode Active';
  }
}

// Export singleton instance
export const testPaymentService = new TestPaymentService();