"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  PlusCircle, 
  Loader2,
  Send,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { userMemoryManager } from "@/lib/memory/user-memory";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { backendService } from "@/lib/api/backend-service";
import { logger } from "@/lib/utils/logger";
import { LoadingDots } from "@/components/ui/loading-dots";

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
  error?: string;
};

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function MemoryEnhancedTherapyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  
  // Voice controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Keyboard overlay adjustment
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Use authenticated user id (support both _id and id)
  const userId = (user?._id as unknown as string) || (user?.id as unknown as string) || "";

  useEffect(() => {
    setMounted(true);
  }, [userId]);

  useEffect(() => {
    loadSubscription();
  }, [user?._id]);

  useEffect(() => {
    loadSessions();
  }, [messages]);

  // Ensure we always reuse a single session for memory-enhanced chat
  useEffect(() => {
    const ensureSession = async () => {
      try {
        // Try to reuse a previously stored session
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('memoryEnhancedSessionId') : null;
        if (storedId) {
          setSessionId(storedId);
          return;
        }

        // Otherwise create a new one (once) and persist it
        const newId = await createChatSession();
        setSessionId(newId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('memoryEnhancedSessionId', newId);
        }
      } catch (e) {
        logger.error('Failed to ensure memory-enhanced session', e);
      }
    };

    // Only run if we don't already have a session in state
    if (!sessionId) {
      ensureSession();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize voice recognition
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        setVoiceSupported(true);
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
          if (isVoiceMode) {
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
              handleSubmit(fakeEvent);
            }, 50);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setVoiceSupported(false);
      }
    } catch {
      setVoiceSupported(false);
    }
  }, []);

  // ChatGPT-style keyboard overlay adjustment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialViewportHeight = window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const keyboardHeight = Math.max(0, initialViewportHeight - currentHeight);
      setKeyboardHeight(keyboardHeight);
    };

    const handleFocus = () => {
      // Store initial height when input is focused
      initialViewportHeight = window.innerHeight;
    };

    const handleBlur = () => {
      // Reset keyboard height when input loses focus
      setTimeout(() => setKeyboardHeight(0), 100);
    };

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }

    // Listen for focus/blur on textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      }
    };
  }, []);


  const loadSubscription = async () => {
    try {
      if (!user?._id) return;
      const res = await backendService.getSubscriptionStatus(user._id as unknown as string);
      if (res?.success) {
        const data = res.data;
        setIsPremium(Boolean(data?.isActive || data?.plan === 'premium'));
      }
    } catch (e) {
      setIsPremium(false);
    }
  };

  const loadSessions = async () => {
    try {
      const allSessions = await getAllChatSessions();
      setSessions(allSessions);
    } catch (error) {
      logger.error("Failed to load sessions", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      try { if (typeof window !== 'undefined') localStorage.setItem('memoryEnhancedSessionId', newSessionId); } catch {}
      setMessages([]);
      setIsLoading(false);
    } catch (error) {
      logger.error("Failed to create new session", error);
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    if (!recognitionRef.current) {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
          if (isVoiceMode) {
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
              handleSubmit(fakeEvent);
            }, 50);
          }
        };
        recognitionRef.current.onend = () => setIsListening(false);
        setVoiceSupported(true);
      }
    }

    if (!voiceSupported || !recognitionRef.current) {
      toast.error("Voice input not supported on this device.");
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      if (typeof window !== 'undefined' && (window as any).speechSynthesis?.speaking) {
        (window as any).speechSynthesis.cancel();
      }
      try { recognitionRef.current.start(); } catch {}
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!isPremium) {
      toast.error("Voice features are Premium only.");
      router.push("/pricing");
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Natural')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (isListening && recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          setIsListening(false);
        }
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        if (isVoiceMode && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch {}
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 160; // max-h-[160px]
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();

    logger.info("Memory-enhanced chat: Form submitted", { currentMessage, isTyping });

    if (!currentMessage || isTyping) return;

    setMessage("");
    setIsTyping(true);
    
    // Reset textarea height but keep keyboard open
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Require auth token before sending to backend
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error("Please sign in to continue the conversation.");
        setIsTyping(false);
        router.push('/login');
        return;
      }

      // Ensure we have a valid user id
      if (!userId) {
        toast.error("Session not fully loaded. Please refresh or sign in again.");
        setIsTyping(false);
        return;
      }

      logger.info("Memory-enhanced chat: About to send message", { 
        currentMessage, 
        userId, 
        sessionId,
        hasToken: !!token 
      });

      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message with memory context
      logger.info("Memory-enhanced chat: Calling sendMemoryEnhancedMessage...");
      const response = await sendMemoryEnhancedMessage(currentMessage);
      logger.info("Memory-enhanced chat: Received response", { response });
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.response || "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
        metadata: {
          analysis: response.analysis || {
            emotionalState: "neutral",
            riskLevel: 0,
            themes: [],
            recommendedApproach: "supportive",
            progressIndicators: [],
          },
          technique: response.metadata?.technique || "supportive",
          goal: response.metadata?.currentGoal || "Provide support",
          progress: response.metadata?.progress || {
            emotionalState: "neutral",
            riskLevel: 0,
          },
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      scrollToBottom();

      // In Voice Mode, auto-play assistant reply
      if (isVoiceMode) {
        speakText(assistantMessage.content);
      }

      // Update user memory
      await userMemoryManager.addTherapySession({
        date: new Date(),
        topics: extractTopics(currentMessage),
        techniques: response.techniques || [],
        breakthroughs: response.breakthroughs || [],
        concerns: extractConcerns(currentMessage),
        goals: [],
        mood: 3,
        summary: `Discussed: ${extractTopics(currentMessage).join(', ')}`
      });


    } catch (error: any) {
      logger.error("Error in chat", error);
      const messageText = (error?.message || "").toString();
      if (messageText.includes("Daily chat limit")) {
        toast.error("Daily chat limit reached on Free plan. Upgrade to continue chatting today.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "You've reached the daily chat limit on the Free plan. Upgrade to Premium for unlimited chats.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        setTimeout(() => router.push('/pricing'), 600);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const sendMemoryEnhancedMessage = async (message: string) => {
    try {
      logger.info('Memory-enhanced chat: Starting sendMemoryEnhancedMessage', { message, userId, sessionId });
      
      const userMemory = await userMemoryManager.loadUserMemory(userId);
      const context = userMemoryManager.getTherapyContext();
      const suggestions = userMemoryManager.getTherapySuggestions();

      logger.info('Memory-enhanced chat: Loaded user memory', { 
        journalEntries: userMemory.journalEntries.length,
        meditationHistory: userMemory.meditationHistory.length,
        moodPatterns: userMemory.moodPatterns.length
      });

      const requestPayload = {
        message,
        sessionId,
        userId,
        context,
        suggestions,
        userMemory: {
          journalEntries: userMemory.journalEntries.slice(-5),
          meditationHistory: userMemory.meditationHistory.slice(-3),
          moodPatterns: userMemory.moodPatterns.slice(-7),
          insights: userMemory.insights.slice(-3),
          profile: userMemory.profile
        }
      };

      logger.info('Memory-enhanced chat: Sending request to /api/chat/memory-enhanced', { 
        payloadSize: JSON.stringify(requestPayload).length 
      });
      
      const response = await fetch('/api/chat/memory-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(requestPayload)
      });

      logger.info(`Memory-enhanced chat: API response status: ${response.status}`, {
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Graceful handling for rate limiting and auth errors
      if (response.status === 429) {
        const data = await response.json();
        logger.warn('Rate limit exceeded, using fallback response');
        return {
          response: data.fallbackResponse || "I understand you'd like to continue our conversation. Please wait a moment before sending your next message.",
          techniques: [],
          breakthroughs: [],
          isRateLimit: true
        };
      }

      if (response.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        router.push('/login');
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errBody = await response.text();
        logger.error(`API error: ${response.status} - ${errBody}`);
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      logger.info('Received successful response from API');
      
      // Ensure we have a valid response
      if (!data.response) {
        logger.warn('No response content in API data');
        throw new Error('No response content received');
      }
      
      return data;
    } catch (error) {
      logger.error('Error sending memory-enhanced message:', error);
      
      // Only use fallback for actual errors, not for successful API responses
      return {
        response: "I'm here to support you. Your thoughts and feelings are important. Please try again in a moment.",
        techniques: [],
        breakthroughs: [],
        isError: true
      };
    }
  };

  const extractTopics = (text: string): string[] => {
    const topics = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('work') || lowerText.includes('job')) topics.push('work');
    if (lowerText.includes('relationship') || lowerText.includes('partner')) topics.push('relationships');
    if (lowerText.includes('anxiety') || lowerText.includes('worried')) topics.push('anxiety');
    if (lowerText.includes('depression') || lowerText.includes('sad')) topics.push('depression');
    if (lowerText.includes('sleep')) topics.push('sleep');
    if (lowerText.includes('health')) topics.push('health');
    
    return topics;
  };

  const extractConcerns = (text: string): string[] => {
    const concerns = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('worried') || lowerText.includes('concerned')) concerns.push('worry');
    if (lowerText.includes('stressed') || lowerText.includes('overwhelmed')) concerns.push('stress');
    if (lowerText.includes('lonely') || lowerText.includes('isolated')) concerns.push('loneliness');
    
    return concerns;
  };

  const handleSuggestedQuestion = async (text: string) => {
    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        try { if (typeof window !== 'undefined') localStorage.setItem('memoryEnhancedSessionId', selectedSessionId); } catch {}
      }
    } catch (error) {
      logger.error("Failed to load session", error);
    } finally {
      setIsLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Please sign in to start a memory‑enhanced session.</p>
          <Button variant="outline" onClick={() => router.push("/login")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Mobile bar for sessions toggle */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">Memory-Enhanced Therapy</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen((p) => !p)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {isSidebarOpen ? "Hide Sessions" : "Show Sessions"}
          </Button>
        </div>
      </div>

      <div 
        className="flex gap-0"
        style={{ 
          height: `calc(100vh - 4rem - ${keyboardHeight}px)`,
          marginTop: '5rem'
        }}
      >
        {/* Sessions Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r bg-background md:w-80 md:static md:translate-x-0 transition-transform duration-200",
            isSidebarOpen
              ? "fixed inset-y-20 left-0 right-0 z-40 translate-x-0 md:static md:inset-auto"
              : "fixed inset-y-20 left-0 right-0 z-40 -translate-x-full md:translate-x-0 md:static md:inset-auto"
          )}
        >
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat Sessions
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="hover:bg-primary/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full justify-start gap-2"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              New Session
            </Button>
            <div className="md:hidden mt-3">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsSidebarOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sessions yet</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={cn(
                      "p-4 rounded-lg text-sm cursor-pointer hover:bg-muted/50 transition-all duration-200 border",
                      session.sessionId === sessionId
                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                        : "bg-background border-border hover:border-primary/20"
                    )}
                    onClick={() => {
                      handleSessionSelect(session.sessionId);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium truncate">
                        {session.messages[0]?.content.slice(0, 25) || "New Chat"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground text-xs mb-2">
                      {session.messages[session.messages.length - 1]?.content ||
                        "No messages yet"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.messages.length} messages</span>
                      <span>
                        {(() => {
                          try {
                            const date = new Date(session.updatedAt);
                            if (isNaN(date.getTime())) {
                              return "Just now";
                            }
                            return formatDistanceToNow(date, {
                              addSuffix: true,
                            });
                          } catch (error) {
                            return "Just now";
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Chat header (minimal) */}
          <div className="px-4 py-3 border-b bg-background flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="font-semibold">AI Therapist</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isVoiceMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!isPremium) {
                    toast.error("Voice Mode is a Premium feature.");
                    router.push("/pricing");
                    return;
                  }
                  const next = !isVoiceMode;
                  setIsVoiceMode(next);
                  if (next) {
                    if (recognitionRef.current && !isListening) {
                      try { recognitionRef.current.start(); setIsListening(true); } catch {}
                    }
                  } else {
                    if (recognitionRef.current && isListening) {
                      try { recognitionRef.current.stop(); } catch {}
                      setIsListening(false);
                    }
                    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
                      window.speechSynthesis.cancel();
                    }
                  }
                }}
                className="gap-2"
                title={isVoiceMode ? "Voice on" : "Voice off"}
              >
                {isVoiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>


          {messages.length === 0 ? (
            // Minimal welcome
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-2xl w-full space-y-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold">AI Therapist</h3>
                </div>
                <p className="text-sm text-muted-foreground">Ask anything. I’ll respond with support and practical guidance.</p>
                <div className="grid gap-3">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <Button
                      key={q.text}
                      variant="outline"
                      className="w-full h-auto py-3 px-4 justify-start"
                      onClick={() => handleSuggestedQuestion(q.text)}
                    >
                      {q.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth pb-20 overscroll-contain">
              <div className="max-w-3xl mx-auto px-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "py-4",
                        msg.role === "assistant" ? "" : ""
                      )}
                    >
                      <div className={cn(
                        "flex gap-3",
                        msg.role === "assistant" ? "" : "justify-end"
                      )}>
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                          msg.role === "assistant" ? "bg-muted/40" : "bg-primary text-primary-foreground"
                        )}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.role !== "assistant" && (
                          <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="py-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <LoadingDots size="sm" color="primary" />
                      <span>AI is typing…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Composer at bottom (sticky) */}
          <div 
            className="sticky bottom-0 z-[60] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 px-4 py-3"
            style={{ 
              transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="flex-1 relative group">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onFocus={() => { try { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); } catch {} }}
                  placeholder={
                    isListening 
                      ? "Listening... Speak now"
                      : "Type your message..."
                  }
                  className={cn(
                    "w-full resize-none rounded-xl border bg-background",
                    "p-3 pr-24 min-h-[44px] max-h-[160px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    isListening && "ring-2 ring-red-500/50 bg-red-50 dark:bg-red-950/20",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/70",
                    isTyping && "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />

                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={toggleListening}
                  disabled={isTyping || !voiceSupported}
                  className={cn(
                    "absolute right-12 bottom-2.5 h-[36px] w-[36px]",
                    "rounded-lg transition-all duration-200",
                    "z-10 bg-background border",
                    isListening && "animate-pulse"
                  )}
                  title={!voiceSupported ? "Voice input not supported" : isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>

                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-2 bottom-2.5 h-[36px] w-[36px]",
                    "rounded-lg transition-all duration-200",
                    "bg-primary hover:bg-primary/90",
                    "shadow-sm shadow-primary/20",
                    (isTyping || !message.trim()) && "opacity-50 cursor-not-allowed",
                    "group-hover:scale-105 group-focus-within:scale-105"
                  )}
                  disabled={isTyping || !message.trim()}
                  onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
