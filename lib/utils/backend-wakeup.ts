/**
 * Backend Wake-Up Utility
 * 
 * This utility helps prevent timeout issues with backends hosted on free tiers
 * (like Render.com) that go to sleep after inactivity. It "wakes up" the backend
 * by making a lightweight request when the app loads.
 */

import { logger } from "./logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const WAKE_UP_TIMEOUT = 15000; // 15 seconds
const WAKE_UP_CACHE_KEY = 'backend_wakeup_time';
const WAKE_UP_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

let wakeUpInProgress = false;
let wakeUpPromise: Promise<boolean> | null = null;

/**
 * Wakes up the backend by making a lightweight health check request
 * Uses caching to avoid unnecessary wake-up calls
 */
export async function wakeUpBackend(): Promise<boolean> {
  // Check if we've recently woken up the backend
  if (typeof window === 'undefined') return false;
  
  const lastWakeUp = localStorage.getItem(WAKE_UP_CACHE_KEY);
  const now = Date.now();
  
  if (lastWakeUp && (now - parseInt(lastWakeUp)) < WAKE_UP_CACHE_DURATION) {
    logger.debug("Backend was recently woken up, skipping...");
    return true;
  }

  // If a wake-up is already in progress, return that promise
  if (wakeUpInProgress && wakeUpPromise) {
    return wakeUpPromise;
  }

  wakeUpInProgress = true;
  wakeUpPromise = performWakeUp();
  
  try {
    const result = await wakeUpPromise;
    return result;
  } finally {
    wakeUpInProgress = false;
    wakeUpPromise = null;
  }
}

async function performWakeUp(): Promise<boolean> {
  try {
    logger.info("Waking up backend...");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WAKE_UP_TIMEOUT);
    
    const startTime = Date.now();
    
    // Use the health endpoint which is lightweight
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      logger.info(`Backend woke up successfully in ${duration}ms`);
      localStorage.setItem(WAKE_UP_CACHE_KEY, Date.now().toString());
      return true;
    } else {
      logger.warn(`Backend wake-up returned status ${response.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.warn("Backend wake-up timed out - backend may be starting up");
    } else {
      logger.error("Error waking up backend:", error);
    }
    return false;
  }
}

/**
 * Automatically wake up the backend when the app loads
 * This can be called in a useEffect or app initialization
 */
export function initBackendWakeUp() {
  if (typeof window === 'undefined') return;
  
  // Wake up immediately
  wakeUpBackend().then(success => {
    if (success) {
      logger.info("Backend is ready");
    } else {
      logger.warn("Backend wake-up failed, but will retry on next request");
    }
  });
  
  // Set up periodic wake-up to keep backend alive during active usage
  const intervalId = setInterval(() => {
    const lastActivity = localStorage.getItem('last_user_activity');
    const now = Date.now();
    
    // Only wake up if user has been active in the last 5 minutes
    if (lastActivity && (now - parseInt(lastActivity)) < 5 * 60 * 1000) {
      wakeUpBackend();
    }
  }, 8 * 60 * 1000); // Every 8 minutes
  
  // Track user activity
  const updateActivity = () => {
    localStorage.setItem('last_user_activity', Date.now().toString());
  };
  
  window.addEventListener('click', updateActivity);
  window.addEventListener('keypress', updateActivity);
  window.addEventListener('touchstart', updateActivity);
  
  // Cleanup
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('click', updateActivity);
    window.removeEventListener('keypress', updateActivity);
    window.removeEventListener('touchstart', updateActivity);
  };
}

