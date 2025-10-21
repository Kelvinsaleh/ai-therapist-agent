import { NextRequest, NextResponse } from "next/server";
import { rateLimiters } from "@/lib/utils/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Rate limit AI insights (10 per minute - expensive operation)
  const rateLimitError = rateLimiters.ai(req);
  if (rateLimitError) return rateLimitError;
  
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('CBT insights API received:', body);

    const { content, mood, type, automaticThoughts, situation } = body;

    // Generate insights directly using Gemini
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        
        if (type === 'journal_insights') {
          // Journal entry insights
          prompt = `As a mental health AI assistant, analyze this journal entry and provide 3-5 brief, supportive insights.

Journal Content: ${content}
Mood (1-6 scale): ${mood}

Provide insights that:
- Recognize patterns and themes
- Offer gentle encouragement
- Suggest coping strategies if needed
- Acknowledge emotions expressed
- Are brief (1-2 sentences each)

Format as a JSON array of strings: ["insight 1", "insight 2", ...]`;
        } else if (type === 'thought_record') {
          // CBT thought record insights
          prompt = `As a CBT therapist AI, analyze this thought record and provide cognitive restructuring insights.

Situation: ${situation}
Automatic Thoughts: ${automaticThoughts}

Provide 3-4 brief CBT-based insights that:
- Identify cognitive distortions
- Suggest alternative perspectives
- Offer balanced thinking approaches
- Encourage evidence-based reasoning

Format as a JSON array of strings: ["insight 1", "insight 2", ...]`;
        } else {
          prompt = `As a mental health AI assistant, provide 3-5 brief, supportive insights about this content.

Content: ${content}

Provide insights that are encouraging, supportive, and helpful for mental well-being.
Format as a JSON array of strings: ["insight 1", "insight 2", ...]`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Gemini raw response:', text);
        
        // Parse the JSON response
        let insights: string[] = [];
        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            insights = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: split by lines
            insights = text.split('\n')
              .map(line => line.trim())
              .filter(line => line && !line.startsWith('```') && !line.startsWith('[') && !line.startsWith(']'))
              .map(line => line.replace(/^["'\-\*\d\.\s]+/, '').replace(/["']$/, ''))
              .filter(line => line.length > 10);
          }
        } catch (parseError) {
          console.error('Failed to parse insights JSON:', parseError);
          // Fallback to splitting by lines
          insights = text.split('\n')
            .map(line => line.trim())
            .filter(line => line && line.length > 10)
            .slice(0, 5);
        }

        console.log('Parsed insights:', insights);

        return NextResponse.json({
          success: true,
          insights: insights.slice(0, 5), // Max 5 insights
          source: 'gemini'
        });

      } catch (aiError) {
        console.error('Gemini AI error:', aiError);
        // Fall through to backend API or fallback
      }
    }

    // Try backend as fallback
    try {
      const response = await fetch(`${BACKEND_API_URL}/cbt/insights/generate`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);

      if (response.ok) {
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.warn('Backend insights failed:', backendError);
    }

    // Final fallback: Use rule-based insights
    const fallbackInsights = generateFallbackInsights(content, mood, type);
    return NextResponse.json({
      success: true,
      insights: fallbackInsights,
      source: 'fallback'
    });

  } catch (error) {
    console.error('CBT insights error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate CBT insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateFallbackInsights(content: string, mood: number, type?: string): string[] {
  const insights: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Mood-based insights
  if (mood <= 2) {
    insights.push("💙 Your low mood is noted. Consider reaching out to someone you trust or trying a grounding exercise.");
  } else if (mood >= 5) {
    insights.push("😊 You're experiencing positive emotions - great to see! Try to identify what's contributing to this feeling.");
  } else {
    insights.push("🌟 Your mood is moderate. Reflect on what might shift it in either direction.");
  }
  
  // Content analysis
  if (lowerContent.includes("grateful") || lowerContent.includes("thankful") || lowerContent.includes("appreciate")) {
    insights.push("🙏 Gratitude practice detected - research shows this significantly boosts well-being!");
  }
  
  if (lowerContent.includes("stress") || lowerContent.includes("anxiety") || lowerContent.includes("worried")) {
    insights.push("🧘 Consider trying deep breathing or progressive muscle relaxation to manage these feelings.");
  }
  
  if (lowerContent.includes("goal") || lowerContent.includes("plan") || lowerContent.includes("achieve")) {
    insights.push("🎯 Goal-oriented thinking - breaking goals into smaller steps can make them more achievable.");
  }
  
  if (lowerContent.includes("friend") || lowerContent.includes("family") || lowerContent.includes("relationship")) {
    insights.push("💕 Social connections are vital for mental health. Nurturing relationships is important.");
  }
  
  if (content.length > 300) {
    insights.push("📝 Detailed reflection shows good self-awareness - this depth is valuable for personal growth.");
  }
  
  // CBT-specific for thought records
  if (type === 'thought_record') {
    if (lowerContent.includes("always") || lowerContent.includes("never") || lowerContent.includes("everyone")) {
      insights.push("🔍 Watch for all-or-nothing thinking. Try considering alternative perspectives or exceptions.");
    }
  }
  
  return insights.slice(0, 5);
}

// Also support GET for historical insights
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get user's historical insights from backend
    const response = await fetch(`${BACKEND_API_URL}/cbt/insights`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch insights' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
