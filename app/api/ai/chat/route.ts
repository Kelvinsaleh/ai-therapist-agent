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
      // Generate a contextual response based on the actual message content
      const lowerMessage = message.toLowerCase();
      let response = "";
      let techniques = [];
      let suggestions = [];

      if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
        response = `I can hear that anxiety is affecting you right now, and I want you to know that you're not alone in this. Anxiety can feel overwhelming, but there are effective ways to manage it.

Let's start with a simple grounding technique: Can you tell me 5 things you can see around you right now? This helps bring your focus to the present moment and can reduce anxious feelings.

What specifically is making you feel anxious? Is it work, relationships, or something else? The more you can share, the better I can help you work through this.`;
        techniques = ["grounding technique", "mindfulness", "active listening"];
        suggestions = ["Practice deep breathing", "Try the 5-4-3-2-1 grounding technique", "Consider talking to someone you trust"];
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
        response = `I can sense that you're going through a really difficult time right now, and I want you to know that your feelings are completely valid. Depression can make everything feel heavy and overwhelming.

It's important to remember that this feeling won't last forever, even though it might feel that way right now. You're taking a brave step by reaching out for support.

Can you tell me more about what's been weighing on your mind lately? Sometimes talking about it can help lighten the load, even just a little bit.`;
        techniques = ["validation", "active listening", "supportive presence"];
        suggestions = ["Consider reaching out to a trusted friend", "Try gentle movement like a short walk", "Practice self-compassion"];
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
        response = `It sounds like you're dealing with a lot of stress right now, and I can understand how overwhelming that must feel. Stress is our body's natural response to challenges, but when it becomes chronic, it can really take a toll on our mental and physical health.

Let's work together to identify what's causing the most stress and find some healthy coping strategies. What's been the biggest source of stress for you lately?

Remember, it's okay to take breaks and prioritize your well-being. You don't have to handle everything at once.`;
        techniques = ["stress management", "problem-solving", "boundary setting"];
        suggestions = ["Break tasks into smaller steps", "Practice time management", "Set realistic expectations"];
      } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
        response = `Relationships can be both our greatest source of joy and our biggest challenges. Whether it's romantic relationships, family dynamics, or friendships, these connections deeply affect our emotional well-being.

It's completely normal to struggle with relationship issues - they're complex and require ongoing work from all parties involved. I'm here to help you navigate whatever relationship challenges you're facing.

What's been the most difficult aspect of your relationships lately? Sometimes it helps to talk through these situations with someone who can offer a fresh perspective.`;
        techniques = ["communication skills", "boundary setting", "active listening"];
        suggestions = ["Practice open communication", "Set healthy boundaries", "Consider couples or family therapy if needed"];
      } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
        response = `Work can be such a significant part of our lives and identity, so when we're struggling with work-related issues, it can feel like it's affecting everything. Whether it's job stress, career uncertainty, or workplace relationships, these challenges can really impact our mental health.

I'm here to help you work through whatever work situation you're dealing with. What's been the most challenging aspect of work for you recently?

Remember, your worth isn't determined by your job performance, and it's okay to seek support when work becomes overwhelming.`;
        techniques = ["work-life balance", "boundary setting", "stress management"];
        suggestions = ["Set clear work boundaries", "Practice time management", "Consider talking to HR or a supervisor"];
      } else {
        response = `Thank you for sharing that with me. I can hear that you're going through something important, and I want you to know that I'm here to listen and support you through whatever you're experiencing.

Your thoughts and feelings are valuable, and I want to help you work through them in a way that feels right for you. Can you tell me more about what's been on your mind? I'm here to listen without judgment.

Sometimes just talking about what's troubling us can help us see things from a different perspective or feel less alone in our struggles.`;
        techniques = ["active listening", "supportive presence", "validation"];
        suggestions = ["Keep a journal to process your thoughts", "Practice self-care activities", "Consider reaching out to trusted friends or family"];
      }

      return NextResponse.json({
        response,
        techniques,
        breakthroughs: [],
        moodAnalysis: {
          current: 3,
          trend: "AI analysis",
          triggers: []
        },
        personalizedSuggestions: suggestions
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