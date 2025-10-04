"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { backendService } from "@/lib/api/backend-service";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
  matchingPreferences?: {
    challenges: string[];
    goals: string[];
    experienceLevel: "beginner" | "intermediate" | "experienced";
    ageRange: [number, number];
    timezone: string;
    communicationStyle: "gentle" | "direct" | "supportive";
    preferredCheckInFrequency: "daily" | "weekly" | "as-needed";
    allowVideoCalls: boolean;
  };
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  userTier: "free" | "premium";
  isLoading: boolean;
  loading: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshUserTier: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setUserTier("free");
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Get user tier/subscription status
          try {
            const tierResponse = await fetch('https://hope-backend-2.onrender.com/subscription/status', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (tierResponse.ok) {
              const tierData = await tierResponse.json();
              setUserTier(tierData.userTier || "free");
            } else {
              setUserTier("free");
            }
          } catch (error) {
            console.error("Error fetching user tier:", error);
            setUserTier("free");
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserTier("free");
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserTier("free");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
      setUserTier("free");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await backendService.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Get user tier after login
        try {
          const tierResponse = await fetch('https://hope-backend-2.onrender.com/subscription/status', {
            headers: {
              'Authorization': `Bearer ${response.data.token}`,
            },
          });
          
          if (tierResponse.ok) {
            const tierData = await tierResponse.json();
            setUserTier(tierData.userTier || "free");
          } else {
            setUserTier("free");
          }
        } catch (error) {
          console.error("Error fetching user tier:", error);
          setUserTier("free");
        }
        
        // Add small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      const response = await backendService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setUserTier("free");
        
        // Add small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    backendService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setUserTier("free");
  };

  const refreshUserTier = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return;

      const tierResponse = await fetch('https://hope-backend-2.onrender.com/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (tierResponse.ok) {
        const tierData = await tierResponse.json();
        setUserTier(tierData.userTier || "free");
      }
    } catch (error) {
      console.error("Error refreshing user tier:", error);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: SessionContextType = {
    user,
    isAuthenticated,
    userTier,
    isLoading,
    loading: isLoading,
    checkSession: checkAuthStatus,
    login,
    register,
    logout,
    refreshUser,
    refreshUserTier,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
