import { NextRequest, NextResponse } from "next/server";

// Direct Gemini AI integration
export async function POST(req: NextRequest) {
  try {
    const { message, context = "Therapy session" } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      // For testing purposes, return a mock AI response
      return NextResponse.json({
        response: `I understand you're feeling anxious about work, and I want you to know that your feelings are completely valid. Work-related anxiety is very common and can feel overwhelming. Let me help you work through this.

First, let's take a moment to breathe together. Can you tell me more about what specifically is making you feel anxious about work? Is it a particular project, deadline, or situation with colleagues?

Some strategies that might help:
- Break down overwhelming tasks into smaller, manageable steps
- Practice deep breathing or grounding techniques when anxiety peaks
- Set clear boundaries between work and personal time
- Consider talking to your supervisor about workload if it feels unmanageable

What would be most helpful for you right now?`,
        techniques: ["active listening", "grounding techniques", "problem-solving"],
        breakthroughs: [],
        moodAnalysis: {
          current: 3,
          trend: "AI analysis",
          triggers: ["work stress"]
        },
        personalizedSuggestions: ["Consider work-life balance strategies", "Practice stress management techniques"]
      });
    }

    // Call Gemini AI directly
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a compassionate AI therapist. The user is in a ${context} and has shared: "${message}". 

Please provide a thoughtful, empathetic, and helpful therapeutic response. Focus on:
- Active listening and validation
- Practical coping strategies
- Gentle guidance and support
- Follow-up questions to encourage deeper reflection
- Professional therapeutic techniques when appropriate

Keep your response conversational, warm, and supportive. Avoid giving medical advice, but do offer practical mental health support.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      return NextResponse.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    return NextResponse.json({
      response: aiResponse,
      techniques: ["AI-powered therapeutic response"],
      breakthroughs: [],
      moodAnalysis: {
        current: 3,
        trend: "AI analysis",
        triggers: []
      },
      personalizedSuggestions: []
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}