import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/ai/gemini-service';

export async function POST(req: NextRequest) {
  try {
    const { message, context, mode = 'therapy' } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Gemini chat request:', { 
      message: message.substring(0, 50) + '...', 
      mode,
      hasContext: !!context 
    });

    let response;
    
    if (mode === 'therapy') {
      response = await geminiService.generateTherapyResponse(message, context);
    } else {
      response = await geminiService.generateChatResponse(message, context);
    }

    if (response.success) {
      console.log('Gemini response generated successfully');
      return NextResponse.json({
        success: true,
        response: response.message,
        message: response.message,
        content: response.message,
        answer: response.message,
        timestamp: new Date().toISOString(),
        source: 'gemini'
      });
    } else {
      console.error('Gemini response failed:', response.error);
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Failed to generate response' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Gemini chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test endpoint to verify Gemini API connection
export async function GET() {
  try {
    const isConnected = await geminiService.testConnection();
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Gemini API connection successful' : 'Gemini API connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test Gemini API connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}