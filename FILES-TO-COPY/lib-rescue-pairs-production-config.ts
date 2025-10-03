export interface RescuePairsProductionConfig {
  // Core functionality
  anonymousMatching: {
    enabled: boolean;
    maxAnonymousPairs: number;
    identityRevealCooldown: number; // hours
    anonymousIdLength: number;
  };
  
  // Communication settings
  communication: {
    chatEnabled: boolean;
    maxMessageLength: number;
    messageRateLimit: number; // messages per minute
    videoCallEnabled: boolean;
    voiceCallEnabled: boolean;
  };
  
  // Safety and moderation
  safety: {
    aiModerationEnabled: boolean;
    contentFilteringEnabled: boolean;
    reportThreshold: number;
    autoBlockEnabled: boolean;
    emergencyEscalationEnabled: boolean;
  };
  
  // Premium features
  premium: {
    unlimitedMatches: boolean;
    advancedFilters: boolean;
    priorityMatching: boolean;
    enhancedCrisisSupport: boolean;
    videoCallAccess: boolean;
  };
  
  // Special access
  specialAccess: {
    enabled: boolean;
    bypassEmails: string[];
    bypassFeatures: string[];
  };
  
  // Monitoring and analytics
  monitoring: {
    enabled: boolean;
    trackMatching: boolean;
    trackCommunication: boolean;
    trackSafetyEvents: boolean;
    performanceMetrics: boolean;
  };
  
  // Rate limiting
  rateLimiting: {
    findMatchesPerHour: number;
    createPairsPerDay: number;
    messagesPerMinute: number;
    apiCallsPerMinute: number;
  };
  
  // Security
  security: {
    encryptMessages: boolean;
    secureStorage: boolean;
    auditLogging: boolean;
    dataRetention: number; // days
  };
}

export const rescuePairsProductionConfig: RescuePairsProductionConfig = {
  anonymousMatching: {
    enabled: true,
    maxAnonymousPairs: 10,
    identityRevealCooldown: 24, // 24 hours
    anonymousIdLength: 8,
  },
  
  communication: {
    chatEnabled: true,
    maxMessageLength: 2000,
    messageRateLimit: 30, // 30 messages per minute
    videoCallEnabled: false, // Coming soon
    voiceCallEnabled: false, // Coming soon
  },
  
  safety: {
    aiModerationEnabled: true,
    contentFilteringEnabled: true,
    reportThreshold: 3,
    autoBlockEnabled: true,
    emergencyEscalationEnabled: true,
  },
  
  premium: {
    unlimitedMatches: true,
    advancedFilters: true,
    priorityMatching: true,
    enhancedCrisisSupport: true,
    videoCallAccess: true,
  },
  
  specialAccess: {
    enabled: true,
    bypassEmails: ['knsalee@gmail.com'],
    bypassFeatures: ['unlimited_matches', 'anonymous_matching', 'video_calls', 'priority_support'],
  },
  
  monitoring: {
    enabled: true,
    trackMatching: true,
    trackCommunication: true,
    trackSafetyEvents: true,
    performanceMetrics: true,
  },
  
  rateLimiting: {
    findMatchesPerHour: 10,
    createPairsPerDay: 5,
    messagesPerMinute: 30,
    apiCallsPerMinute: 60,
  },
  
  security: {
    encryptMessages: true,
    secureStorage: true,
    auditLogging: true,
    dataRetention: 365, // 1 year
  },
};

export function validateRescuePairsConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!rescuePairsProductionConfig.anonymousMatching.enabled) {
    errors.push('Anonymous matching must be enabled for production');
  }
  
  if (rescuePairsProductionConfig.communication.maxMessageLength < 100) {
    errors.push('Message length limit too low for meaningful communication');
  }
  
  if (rescuePairsProductionConfig.safety.aiModerationEnabled === false) {
    errors.push('AI moderation must be enabled for user safety');
  }
  
  if (rescuePairsProductionConfig.rateLimiting.findMatchesPerHour < 5) {
    errors.push('Rate limiting too restrictive for user experience');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export class RescuePairsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: any
  ) {
    super(message);
    this.name = 'RescuePairsError';
  }
}

export function logRescuePairsEvent(
  event: string, 
  data: any, 
  level: 'info' | 'warn' | 'error' = 'info',
  userId?: string
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event,
    level,
    userId,
    data,
    environment: process.env.NODE_ENV,
    service: 'rescue-pairs'
  };
  
  if (level === 'error') {
    console.error(`[RESCUE-PAIRS-ERROR] ${event}:`, logData);
  } else if (level === 'warn') {
    console.warn(`[RESCUE-PAIRS-WARN] ${event}:`, logData);
  } else {
    console.log(`[RESCUE-PAIRS-INFO] ${event}:`, logData);
  }
  
  // In production, this would send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (e.g., DataDog, New Relic, etc.)
    // monitorService.log(logData);
  }
}

export async function retryRescuePairsOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        logRescuePairsEvent('operation_failed_final', {
          attempt,
          error: lastError.message,
          maxAttempts
        }, 'error');
        throw new RescuePairsError(
          `Operation failed after ${maxAttempts} attempts: ${lastError.message}`,
          'OPERATION_FAILED',
          500,
          { attempts: maxAttempts, lastError: lastError.message }
        );
      }
      
      logRescuePairsEvent('operation_retry', {
        attempt,
        error: lastError.message,
        nextAttemptIn: delay
      }, 'warn');
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw lastError!;
}

export function checkSpecialAccess(email: string): boolean {
  return rescuePairsProductionConfig.specialAccess.enabled && 
         rescuePairsProductionConfig.specialAccess.bypassEmails.includes(email.toLowerCase());
}

export function getEffectiveUserTier(userEmail?: string, userTier?: string): string {
  if (userEmail && checkSpecialAccess(userEmail)) {
    return 'special';
  }
  return userTier || 'free';
}

export function canAccessFeature(feature: string, userEmail?: string, userTier?: string): boolean {
  const effectiveTier = getEffectiveUserTier(userEmail, userTier);
  
  // Special access users get everything
  if (effectiveTier === 'special') {
    return true;
  }
  
  // Premium users get premium features
  if (effectiveTier === 'premium') {
    return rescuePairsProductionConfig.premium[feature as keyof typeof rescuePairsProductionConfig.premium] === true;
  }
  
  // Free users get basic features only
  return false;
}