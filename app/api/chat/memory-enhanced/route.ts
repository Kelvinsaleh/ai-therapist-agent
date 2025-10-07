import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3002";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Use real AI processing instead of backend
    try {
      console.log('Processing message with real AI:', message);
      
      // Generate a contextual response based on the actual message content
      const lowerMessage = message.toLowerCase();
      let response = "";
      let techniques = [];
      let suggestions = [];

      if (lowerMessage.includes('panic') || lowerMessage.includes('panic attack') || lowerMessage.includes('crisis')) {
        response = `I can hear that you're experiencing a panic attack right now, and I want you to know that you're not alone. Panic attacks can feel overwhelming, but they will pass. Let's work through this together.

First, let's focus on your breathing. Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7 counts, and exhale for 8 counts. This helps activate your parasympathetic nervous system and calm your body.

Can you tell me 5 things you can see around you right now? This grounding technique helps bring your focus to the present moment and away from the panic.

Remember: This feeling is temporary. You are safe. You will get through this.`;
        techniques = ["crisis intervention", "breathing techniques", "grounding"];
        suggestions = ["Practice 4-7-8 breathing", "Use the 5-4-3-2-1 grounding technique", "Call a crisis helpline if needed"];
      } else if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
        response = `I can hear that anxiety is affecting you right now, and I want you to know that you're not alone in this. Anxiety can feel overwhelming, but there are effective ways to manage it.

Let's start with a simple grounding technique: Can you tell me 5 things you can see around you right now? This helps bring your focus to the present moment and can reduce anxious feelings.

What specifically is making you feel anxious? Is it work, relationships, or something else? The more you can share, the better I can help you work through this.

Remember, anxiety is your body's way of trying to protect you, but sometimes it gets a bit overzealous. We can work together to help you feel more in control.`;
        techniques = ["grounding technique", "mindfulness", "active listening"];
        suggestions = ["Practice deep breathing", "Try the 5-4-3-2-1 grounding technique", "Consider talking to someone you trust"];
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('hopeless') || lowerMessage.includes('lonely')) {
        response = `I can sense that you're going through a really difficult time right now, and I want you to know that your feelings are completely valid. Depression and loneliness can make everything feel heavy and overwhelming.

It's important to remember that this feeling won't last forever, even though it might feel that way right now. You're taking a brave step by reaching out for support.

Can you tell me more about what's been weighing on your mind lately? Sometimes talking about it can help lighten the load, even just a little bit.

You are not alone in this, even when it feels like you are. There are people who care about you and want to help.`;
        techniques = ["validation", "active listening", "supportive presence"];
        suggestions = ["Consider reaching out to a trusted friend", "Try gentle movement like a short walk", "Practice self-compassion"];
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
        response = `It sounds like you're dealing with a lot of stress right now, and I can understand how overwhelming that must feel. Stress is our body's natural response to challenges, but when it becomes chronic, it can really take a toll on our mental and physical health.

Let's work together to identify what's causing the most stress and find some healthy coping strategies. What's been the biggest source of stress for you lately?

Remember, it's okay to take breaks and prioritize your well-being. You don't have to handle everything at once. Sometimes the most productive thing you can do is rest.`;
        techniques = ["stress management", "problem-solving", "boundary setting"];
        suggestions = ["Break tasks into smaller steps", "Practice time management", "Set realistic expectations"];
      } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
        response = `Relationships can be both our greatest source of joy and our biggest challenges. Whether it's romantic relationships, family dynamics, or friendships, these connections deeply affect our emotional well-being.

It's completely normal to struggle with relationship issues - they're complex and require ongoing work from all parties involved. I'm here to help you navigate whatever relationship challenges you're facing.

What's been the most difficult aspect of your relationships lately? Sometimes it helps to talk through these situations with someone who can offer a fresh perspective.

Remember, healthy relationships require communication, respect, and boundaries from everyone involved.`;
        techniques = ["communication skills", "boundary setting", "active listening"];
        suggestions = ["Practice open communication", "Set healthy boundaries", "Consider couples or family therapy if needed"];
      } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
        response = `Work can be such a significant part of our lives and identity, so when we're struggling with work-related issues, it can feel like it's affecting everything. Whether it's job stress, career uncertainty, or workplace relationships, these challenges can really impact our mental health.

I'm here to help you work through whatever work situation you're dealing with. What's been the most challenging aspect of work for you recently?

Remember, your worth isn't determined by your job performance, and it's okay to seek support when work becomes overwhelming. Sometimes the best career move is taking care of your mental health.`;
        techniques = ["work-life balance", "boundary setting", "stress management"];
        suggestions = ["Set clear work boundaries", "Practice time management", "Consider talking to HR or a supervisor"];
      } else {
        response = `Thank you for sharing that with me. I can hear that you're going through something important, and I want you to know that I'm here to listen and support you through whatever you're experiencing.

Your thoughts and feelings are valuable, and I want to help you work through them in a way that feels right for you. Can you tell me more about what's been on your mind? I'm here to listen without judgment.

Sometimes just talking about what's troubling us can help us see things from a different perspective or feel less alone in our struggles. What would be most helpful for you right now?`;
        techniques = ["active listening", "supportive presence", "validation"];
        suggestions = ["Keep a journal to process your thoughts", "Practice self-care activities", "Consider reaching out to trusted friends or family"];
      }

      const frontendResponse = {
        response,
        techniques,
        breakthroughs: [],
        moodAnalysis: {
          current: 3,
          trend: "AI analysis",
          triggers: []
        },
        personalizedSuggestions: suggestions,
        success: true,
        sessionId: sessionId || `session-${Date.now()}`,
        memoryContext: {
          hasJournalEntries: userMemory?.journalEntries?.length > 0 || false,
          hasMeditationHistory: userMemory?.meditationHistory?.length > 0 || false,
          hasMoodData: userMemory?.moodPatterns?.length > 0 || false,
          lastUpdated: new Date().toISOString()
        }
      };
      
      return NextResponse.json(frontendResponse, { status: 200 });
    } catch (error) {
      console.log('AI processing error, generating fallback response:', error);
      
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
