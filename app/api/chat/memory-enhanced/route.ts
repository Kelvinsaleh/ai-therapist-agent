import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const GEMINI_API_KEY = "AIzaSyCCRSas8dVBP3ye4ZY5RBPsYqw7m_2jro8";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check for authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Use direct Gemini integration for real AI responses
    console.log("Using direct Gemini integration for AI responses...");
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a compassionate AI mental health therapist. A user has sent you this message: "${message}". 

Please provide a supportive, helpful response as a mental health professional. Be empathetic, understanding, and offer practical suggestions if appropriate. Keep your response conversational and warm.

User context: ${JSON.stringify(userMemory)}
Session ID: ${sessionId}
User ID: ${userId}`
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

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to support you. Please try again in a moment.";
      
      return NextResponse.json({
        success: true,
        response: aiResponse,
        sessionId,
        suggestions: [
          "Consider starting a daily journal to track your thoughts",
          "Try a guided meditation session", 
          "Take a moment to practice deep breathing"
        ],
        memoryContext: {
          hasJournalEntries: userMemory?.journalEntries?.length > 0,
          hasMeditationHistory: userMemory?.meditationHistory?.length > 0,
          hasMoodData: userMemory?.moodPatterns?.length > 0,
          lastUpdated: new Date().toISOString()
        },
        isDirectGemini: true
      });
    } else {
      const errorData = await geminiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to get AI response",
          fallbackResponse: "I'm here to support you. Please try again in a moment."
        }, 
        { status: geminiResponse.status }
      );
    }
  } catch (error) {
    console.error("Memory-enhanced chat error:", error);
    
    // Try direct Gemini integration as fallback
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a compassionate AI mental health therapist. A user has sent you this message: "${message}". 

Please provide a supportive, helpful response as a mental health professional. Be empathetic, understanding, and offer practical suggestions if appropriate. Keep your response conversational and warm.

User context: ${JSON.stringify(userMemory)}
Session ID: ${sessionId}
User ID: ${userId}`
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

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to support you. Please try again in a moment.";
        
        return NextResponse.json({
          success: true,
          response: aiResponse,
          sessionId,
          suggestions: [
            "Consider starting a daily journal to track your thoughts",
            "Try a guided meditation session", 
            "Take a moment to practice deep breathing"
          ],
          memoryContext: {
            hasJournalEntries: userMemory?.journalEntries?.length > 0,
            hasMeditationHistory: userMemory?.meditationHistory?.length > 0,
            hasMoodData: userMemory?.moodPatterns?.length > 0,
            lastUpdated: new Date().toISOString()
          },
          isDirectGemini: true
        });
      }
    } catch (geminiError) {
      console.error("Gemini integration failed:", geminiError);
    }

    return NextResponse.json(
      { 
        error: "Failed to process memory-enhanced message",
        fallbackResponse: "I'm here to support you. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}
