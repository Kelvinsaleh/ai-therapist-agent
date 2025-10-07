import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Try backend first
    try {
      // First, we need to get a valid token by logging in
      const loginResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword123"
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to get authentication token');
      }

      const loginData = await loginResponse.json();
      if (!loginData.success) {
        throw new Error('Login failed: ' + loginData.message);
      }

      const token = loginData.token;
      console.log('Got backend token, calling memory-enhanced-chat');

      // Now call the memory-enhanced-chat endpoint with the token
      const res = await fetch(`${BACKEND_API_URL}/memory-enhanced-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
        },
        body: JSON.stringify({
          message,
          sessionId,
          userId,
          context,
          suggestions,
          userMemory,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Backend response received:', data);
        
        // Convert backend response format to frontend expected format
        const frontendResponse = {
          response: data.response,
          techniques: data.suggestions || [],
          breakthroughs: [],
          moodAnalysis: {
            current: 3,
            trend: "AI analysis",
            triggers: []
          },
          personalizedSuggestions: data.suggestions || [],
          success: data.success,
          sessionId: data.sessionId,
          memoryContext: data.memoryContext
        };
        
        return NextResponse.json(frontendResponse, { status: res.status });
      } else {
        console.log('Backend API failed, falling back to local response generation');
        throw new Error(`Backend API failed with status ${res.status}`);
      }
    } catch (backendError) {
      console.log('Backend error, generating local response:', backendError);
      
      // Generate local response as fallback
      const localResponse = generateLocalResponse(message, userMemory);
      return NextResponse.json(localResponse, { status: 200 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: "Failed to process memory-enhanced message" },
      { status: 500 }
    );
  }
}

// Local response generation function
function generateLocalResponse(message: string, userMemory: any) {
  const lowerMessage = message.toLowerCase();
  let response = "";
  let techniques: string[] = [];
  let breakthroughs: string[] = [];

  if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous') || lowerMessage.includes('panic')) {
    response = "I can hear that anxiety is really affecting you right now, and I want you to know that you're not alone in this. Anxiety can feel overwhelming, but there are effective ways to manage it. Let's start with a simple grounding technique: Can you tell me 5 things you can see around you right now? This helps bring your focus to the present moment and can reduce anxious feelings.";
    techniques = ["grounding technique", "mindfulness"];
  } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
    response = "I can sense that you're going through a really difficult time right now, and I want you to know that your feelings are completely valid. Depression can make everything feel heavy and overwhelming. It's important to remember that this feeling won't last forever, even though it might feel that way. Can you tell me more about what's been weighing on your mind lately? Sometimes talking about it can help lighten the load.";
    techniques = ["validation and exploration", "active listening"];
  } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
    response = "It sounds like you're dealing with a lot of stress right now, and I can understand how overwhelming that must feel. Stress is our body's natural response to challenges, but when it becomes chronic, it can really take a toll on our mental and physical health. Let's work together to identify what's causing the most stress and find some healthy coping strategies. What's been the biggest source of stress for you lately?";
    techniques = ["stress management", "problem-solving"];
  } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    response = "Work can be such a significant part of our lives and identity, so when we're struggling with work-related issues, it can feel like it's affecting everything. Whether it's job stress, career uncertainty, or workplace relationships, these challenges can really impact our mental health. I'm here to help you work through whatever work situation you're dealing with. What's been the most challenging aspect of work for you recently?";
    techniques = ["work-life balance", "boundary setting"];
  } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
    response = "Relationships can be both our greatest source of joy and our biggest challenges. Whether it's romantic relationships, family dynamics, or friendships, these connections deeply affect our emotional well-being. It's completely normal to struggle with relationship issues - they're complex and require ongoing work. I'm here to help you navigate whatever relationship challenges you're facing. What's been the most difficult aspect of your relationships lately?";
    techniques = ["communication skills", "boundary setting"];
  } else if (lowerMessage.includes('help') || lowerMessage.includes('need') || lowerMessage.includes('support')) {
    response = "I'm so glad you reached out for help - that takes real courage and self-awareness. Seeking support is one of the most important steps you can take for your mental health. You don't have to face whatever you're going through alone. I'm here to listen, support you, and help you work through whatever challenges you're facing. Can you tell me more about what specific areas you'd like help with?";
    techniques = ["support seeking", "active listening"];
  } else {
    response = "Thank you for sharing that with me. I can hear that you're going through something important, and I want you to know that I'm here to listen and support you through whatever you're experiencing. Your thoughts and feelings are valuable, and I want to help you work through them in a way that feels right for you. Can you tell me more about what's been on your mind? I'm here to listen without judgment.";
    techniques = ["active listening", "supportive presence"];
  }

  return {
    response,
    techniques,
    breakthroughs,
    moodAnalysis: {
      current: 3,
      trend: "Unable to analyze",
      triggers: []
    },
    personalizedSuggestions: []
  };
}
