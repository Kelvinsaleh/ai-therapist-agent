import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify payment system is working
export async function GET(req: NextRequest) {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      paystack: {
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 'Set' : 'Not Set',
        secretKey: process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not Set',
        webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ? 'Set' : 'Not Set',
      },
      backend: {
        url: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Not Set',
      },
      testMode: {
        enabled: process.env.NEXT_PUBLIC_ENABLE_TEST_PAYMENTS === 'true',
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Payment system test endpoint is working',
      data: testData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test payment initialization
export async function POST(req: NextRequest) {
  try {
    const { email, planId, userId } = await req.json();

    if (!email || !planId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Simulate payment initialization
    const mockResponse = {
      success: true,
      reference: `TEST_${Date.now()}_${userId}`,
      authorization_url: `https://checkout.paystack.com/test/TEST_${Date.now()}_${userId}`,
      access_code: `test_access_${Date.now()}`,
      message: 'Test payment initialized successfully'
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test payment initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}