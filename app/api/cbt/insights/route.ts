import { NextRequest, NextResponse } from "next/server";
import { detectCognitiveDistortions, generateThoughtChallengingQuestions, generateBalancedThoughtSuggestions, suggestCopingStrategies } from "@/lib/cbt/utils";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Accept mock token for testing
    const token = authHeader.replace('Bearer ', '');
    if (token !== "mock-jwt-token-for-testing") {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { text, type, mood, emotions, situation } = await req.json();

    if (!text || !type) {
      return NextResponse.json(
        { success: false, error: 'Text and type are required' },
        { status: 400 }
      );
    }

    let insights: any = {};

    if (type === 'thought_analysis') {
      // Analyze cognitive distortions
      const distortions = detectCognitiveDistortions(text);
      const challengingQuestions = generateThoughtChallengingQuestions(text, distortions);
      const balancedSuggestions = generateBalancedThoughtSuggestions(text, '', '', distortions);

      insights = {
        cognitiveDistortions: distortions,
        challengingQuestions,
        balancedSuggestions,
        hasDistortions: distortions.length > 0
      };
    }

    if (type === 'mood_analysis' && mood !== undefined) {
      // Suggest coping strategies
      const copingStrategies = suggestCopingStrategies(mood, emotions || [], situation || '');

      insights = {
        copingStrategies,
        moodLevel: mood,
        suggestedInterventions: mood <= 4 ? ['crisis_support', 'immediate_coping'] : ['preventive_coping']
      };
    }

    if (type === 'general_insights') {
      // General CBT insights
      const distortions = detectCognitiveDistortions(text);
      const copingStrategies = suggestCopingStrategies(mood || 5, emotions || [], situation || '');

      insights = {
        cognitiveDistortions: distortions,
        copingStrategies,
        overallAssessment: distortions.length > 2 ? 'high_distortion' : 
                          distortions.length > 0 ? 'moderate_distortion' : 'low_distortion'
      };
    }

    return NextResponse.json({
      success: true,
      data: insights
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
