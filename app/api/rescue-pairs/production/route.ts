import { NextRequest, NextResponse } from 'next/server';
import { 
  rescuePairsProductionConfig, 
  logRescuePairsEvent, 
  retryRescuePairsOperation,
  RescuePairsError,
  checkSpecialAccess,
  canAccessFeature,
  validateRescuePairsConfig
} from '@/lib/rescue-pairs/production-config';

// Production-ready rescue pairs endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    const userTier = req.headers.get('x-user-tier') || 'free';

    logRescuePairsEvent('api_request', {
      action,
      userId,
      userTier,
      hasSpecialAccess: userEmail ? checkSpecialAccess(userEmail) : false
    }, 'info', userId);

    // Validate configuration
    const configValidation = validateRescuePairsConfig();
    if (!configValidation.isValid) {
      logRescuePairsEvent('config_validation_failed', {
        errors: configValidation.errors
      }, 'error');
      
      return NextResponse.json({
        success: false,
        error: 'System configuration error',
        details: configValidation.errors
      }, { status: 500 });
    }

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            system: 'operational',
            features: rescuePairsProductionConfig,
            userAccess: {
              tier: userTier,
              hasSpecialAccess: userEmail ? checkSpecialAccess(userEmail) : false,
              canFindMatches: canAccessFeature('unlimitedMatches', userEmail, userTier),
              canAnonymousMatch: canAccessFeature('anonymousMatching', userEmail, userTier),
              canVideoCall: canAccessFeature('videoCallAccess', userEmail, userTier)
            },
            timestamp: new Date().toISOString()
          }
        });

      case 'health':
        return NextResponse.json({
          success: true,
          data: {
            status: 'healthy',
            version: '1.0.0',
            environment: process.env.NODE_ENV,
            features: {
              anonymousMatching: rescuePairsProductionConfig.anonymousMatching.enabled,
              communication: rescuePairsProductionConfig.communication.chatEnabled,
              safety: rescuePairsProductionConfig.safety.aiModerationEnabled,
              monitoring: rescuePairsProductionConfig.monitoring.enabled
            }
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }

  } catch (error) {
    const rescuePairsError = error instanceof RescuePairsError ? error : new RescuePairsError(
      error instanceof Error ? error.message : 'Unknown error',
      'API_ERROR',
      500
    );

    logRescuePairsEvent('api_error', {
      error: rescuePairsError.message,
      code: rescuePairsError.code
    }, 'error');

    return NextResponse.json({
      success: false,
      error: rescuePairsError.message,
      code: rescuePairsError.code
    }, { status: rescuePairsError.statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    const userTier = req.headers.get('x-user-tier') || 'free';

    logRescuePairsEvent('api_post_request', {
      action,
      userId,
      userTier,
      hasSpecialAccess: userEmail ? checkSpecialAccess(userEmail) : false
    }, 'info', userId);

    switch (action) {
      case 'find_matches':
        // Check access permissions
        const hasSpecialAccess = userEmail ? checkSpecialAccess(userEmail) : false;
        const canFindMatches = hasSpecialAccess || canAccessFeature('unlimitedMatches', userEmail, userTier);
        
        if (!canFindMatches) {
          logRescuePairsEvent('access_denied', {
            userTier,
            hasSpecialAccess,
            feature: 'unlimitedMatches'
          }, 'warn', userId);
          
          return NextResponse.json({
            success: false,
            error: 'Premium matching is available with Premium Plan. Upgrade for unlimited matches!',
            code: 'ACCESS_DENIED'
          }, { status: 403 });
        }

        // Simulate finding matches with production configuration
        const mockMatches = Array.from({ length: hasSpecialAccess ? 10 : 3 }, (_, i) => ({
          _id: `match_${Date.now()}_${i}`,
          userId: {
            _id: `user_${i}`,
            name: data.isAnonymous ? undefined : `User ${i}`,
            email: `user${i}@example.com`
          },
          compatibilityScore: Math.floor(Math.random() * 20) + 80,
          sharedChallenges: ['Anxiety', 'Stress Management'],
          complementaryGoals: ['Mindfulness', 'Better Sleep'],
          communicationStyle: 'supportive',
          experienceLevel: 'intermediate',
          trustLevel: 9,
          emergencySupport: true,
          isAnonymous: data.isAnonymous || false,
          anonymousId: data.isAnonymous ? `anon_${Date.now()}_${Math.random().toString(36).substr(2, rescuePairsProductionConfig.anonymousMatching.anonymousIdLength)}` : undefined
        }));

        logRescuePairsEvent('matches_found', {
          count: mockMatches.length,
          isAnonymous: data.isAnonymous,
          hasSpecialAccess
        }, 'info', userId);

        return NextResponse.json({
          success: true,
          data: {
            matches: mockMatches,
            total: mockMatches.length,
            anonymous: data.isAnonymous,
            timestamp: new Date().toISOString()
          }
        });

      case 'create_pair':
        // Check access permissions
        const canCreatePairs = hasSpecialAccess || canAccessFeature('unlimitedMatches', userEmail, userTier);
        
        if (!canCreatePairs) {
          return NextResponse.json({
            success: false,
            error: 'Premium feature. Upgrade to create rescue pairs!',
            code: 'ACCESS_DENIED'
          }, { status: 403 });
        }

        // Simulate creating rescue pair
        const mockPair = {
          _id: `pair_${Date.now()}`,
          user1Id: { _id: userId, email: userEmail },
          user2Id: { _id: data.targetUserId, email: 'partner@example.com' },
          status: 'pending',
          isAnonymous: data.isAnonymous || false,
          anonymousId: data.anonymousId,
          chatEnabled: false,
          revealIdentity: false,
          compatibilityScore: Math.floor(Math.random() * 20) + 80,
          sharedChallenges: ['Anxiety', 'Stress Management'],
          complementaryGoals: ['Mindfulness', 'Better Sleep'],
          communicationStyle: 'supportive',
          experienceLevel: 'intermediate',
          trustLevel: 9,
          emergencySupport: true,
          createdAt: new Date().toISOString(),
          acceptedAt: null
        };

        logRescuePairsEvent('pair_created', {
          pairId: mockPair._id,
          isAnonymous: data.isAnonymous,
          hasSpecialAccess
        }, 'info', userId);

        return NextResponse.json({
          success: true,
          data: mockPair
        });

      case 'reveal_identity':
        logRescuePairsEvent('identity_revealed', {
          pairId: data.pairId,
          userId
        }, 'info', userId);

        return NextResponse.json({
          success: true,
          data: {
            pairId: data.pairId,
            revealed: true,
            timestamp: new Date().toISOString()
          }
        });

      case 'enable_chat':
        logRescuePairsEvent('chat_enabled', {
          pairId: data.pairId,
          userId
        }, 'info', userId);

        return NextResponse.json({
          success: true,
          data: {
            pairId: data.pairId,
            chatEnabled: true,
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }

  } catch (error) {
    const rescuePairsError = error instanceof RescuePairsError ? error : new RescuePairsError(
      error instanceof Error ? error.message : 'Unknown error',
      'API_ERROR',
      500
    );

    logRescuePairsEvent('api_error', {
      error: rescuePairsError.message,
      code: rescuePairsError.code
    }, 'error');

    return NextResponse.json({
      success: false,
      error: rescuePairsError.message,
      code: rescuePairsError.code
    }, { status: rescuePairsError.statusCode });
  }
}