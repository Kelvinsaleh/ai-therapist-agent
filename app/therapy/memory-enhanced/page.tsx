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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton, SkeletonChat } from "@/components/ui/skeleton";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

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
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  
  // Scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Voice controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Keyboard overlay adjustment using custom hook
  const keyboardHeight = useKeyboardOffset();

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

  // Check for existing session or redirect to sessions list
  useEffect(() => {
    const checkSession = async () => {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('memoryEnhancedSessionId') : null;
      
      if (!storedId) {
        // No session found, redirect to sessions list
        router.push('/therapy/memory-enhanced/sessions');
        return;
      }
      
      setSessionId(storedId);
    };

    checkSession();
  }, [router]);

  // Load chat history whenever we have a valid sessionId
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!sessionId) return;
        const history = await getChatHistory(sessionId);
        if (Array.isArray(history)) {
          const formatted = history.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
          setMessages(formatted);
        }
      } catch (e) {
        logger.error('Failed to load memory-enhanced session history', e);
      }
    };
    loadHistory();
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

  // Keyboard detection is now handled by useKeyboardOffset hook


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
    // Scroll the messages container to bottom, not the entire viewport
    // This prevents the input from jumping when new messages arrive
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
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
      const maxHeight = 120; // max-h-[120px] - compact for better screen fit
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
      // Require auth and valid session
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error("Please sign in to continue the conversation.");
        setIsTyping(false);
        router.push('/login');
        return;
      }
      if (!userId || !sessionId) {
        toast.error("Session not fully loaded. Please refresh or sign in again.");
        setIsTyping(false);
        return;
      }

      logger.info("Memory-enhanced chat: Sending via session endpoint", { currentMessage, sessionId });

      // Add user message locally for immediacy
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Use the unified session-based endpoint so the backend has full context
      const response = await sendChatMessage(sessionId, currentMessage);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          (response as any).response || (response as any).message ||
          "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
        metadata: {
          analysis: (response as any).analysis || {
            emotionalState: "neutral",
            riskLevel: 0,
            themes: [],
            recommendedApproach: "supportive",
            progressIndicators: [],
          },
          technique: (response as any).metadata?.technique || "supportive",
          goal: (response as any).metadata?.currentGoal || "Provide support",
          progress: (response as any).metadata?.progress || {
            emotionalState: "neutral",
            riskLevel: 0,
          },
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      scrollToBottom();

      // Keep textarea focused to maintain keyboard visibility on mobile
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      if (isVoiceMode) {
        speakText(assistantMessage.content);
      }

      // Optional: keep memory updates; safe to leave as-is without blocking UX
      try {
        await userMemoryManager.addTherapySession({
          date: new Date(),
          topics: extractTopics(currentMessage),
          techniques: [],
          breakthroughs: [],
          concerns: extractConcerns(currentMessage),
          goals: [],
          mood: 3,
          summary: `Discussed: ${extractTopics(currentMessage).join(', ')}`
        });
      } catch {}

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

  // Removed custom memory-enhanced API call in favor of unified session flow

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

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      // Call the completion API
      if (sessionId) {
        const { completeChatSession } = await import("@/lib/api/chat");
        await completeChatSession(sessionId);
        logger.info(`Memory-enhanced session ${sessionId} completed successfully`);
      }
      
      // Show success toast
      toast.success("Session completed successfully!");
      
    } catch (error) {
      logger.error("Error completing session", error);
      toast.error("Failed to complete session. Please try again.");
    } finally {
      setIsCompletingSession(false);
    }
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


  if (authLoading || !mounted || isLoading || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
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


  return (
    <div className="fixed inset-0 bg-background w-full" style={{ position: 'fixed', width: '100%', height: '100vh' }}>
      
      {/* Floating back button - ALWAYS fixed to viewport top, never moves */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/therapy/memory-enhanced/sessions')}
        className="fixed top-4 left-4 z-[100] w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-background"
        style={{ position: 'fixed' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </Button>

      <div className="flex w-full h-full">
        {/* Main chat area - full width, no sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background w-full h-full">


          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-sm mx-auto mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Start a conversation by typing your message below.
                </p>
              </div>
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              className={cn(
                "flex-1 overflow-y-auto chat-messages",
                "pb-[calc(80px+env(safe-area-inset-bottom))]"
              )}
              style={{ height: '100%' }}
            >
              <div className="max-w-6xl mx-auto px-2">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="py-3 group"
                    >
                      <div className={cn(
                        "flex gap-2.5 max-w-full",
                        msg.role === "assistant" ? "" : "justify-end"
                      )}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 shrink-0 mt-0.5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={cn(
                          "rounded-xl text-sm leading-relaxed",
                          "shadow-sm transition-all duration-200",
                          msg.role === "assistant" 
                            ? "max-w-[85%] px-3 py-2 bg-gradient-to-br from-muted/60 to-muted/40 border border-muted/60" 
                            : "max-w-[75%] px-2.5 py-1.5 bg-primary text-primary-foreground"
                        )}>
                          <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="my-2 ml-4 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 ml-4 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => (
                                  <code className="px-1.5 py-0.5 bg-muted/80 rounded text-xs font-mono">
                                    {children}
                                  </code>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground">
                                    {children}
                                  </blockquote>
                                )
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Message timestamp */}
                          <div className={cn(
                            "text-xs mt-2 opacity-0 group-hover:opacity-60 transition-opacity",
                            msg.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        {msg.role !== "assistant" && (
                          <div className="w-7 h-7 shrink-0 mt-0.5 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground flex items-center justify-center ring-1 ring-secondary/20 shadow-sm">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Enhanced Composer - ALWAYS FIXED TO VIEWPORT */}
          <div 
            className="fixed inset-x-0 z-[60] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 fixed-input-container"
            style={{ 
              position: 'fixed', // Ensure always fixed to viewport
              bottom: `calc(var(--keyboard-offset, 0px) + env(safe-area-inset-bottom))`,
            }}
          >
            {/* Typing indicator for AI */}
            {isTyping && (
              <div className="px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-3 py-2">
              <div className="max-w-6xl mx-auto">
                <div className="relative group">
                  {/* Input container with enhanced styling */}
                  <div className={cn(
                    "relative rounded-xl border transition-all duration-200",
                    "bg-background shadow-sm",
                    message.trim() ? "border-primary/30 shadow-primary/10" : "border-border",
                    isListening && "border-red-500/50 bg-red-50 dark:bg-red-950/20",
                    "focus-within:border-primary/50 focus-within:shadow-primary/20"
                  )}>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        adjustTextareaHeight();
                      }}
                      onFocus={() => { 
                        try { 
                          // Scroll the container to bottom, not the viewport
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                          }
                        } catch {} 
                      }}
                      placeholder={
                        isListening 
                          ? "🎤 Listening... Speak now"
                          : "Share what's on your mind..."
                      }
                      className={cn(
                        "w-full resize-none bg-transparent",
                        "px-3 py-2.5 pr-16 min-h-[42px] max-h-[120px]",
                        "text-sm",
                        "focus:outline-none",
                        "transition-all duration-200",
                        "placeholder:text-muted-foreground/70 placeholder:font-normal",
                        "text-foreground",
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

                    {/* Action buttons with enhanced styling */}
                    <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
                      {/* Voice button */}
                      <Button
                        type="button"
                        size="icon"
                        variant={isListening ? "destructive" : "ghost"}
                        onClick={toggleListening}
                        disabled={isTyping || !voiceSupported}
                        className={cn(
                          "h-7 w-7 rounded-lg transition-all duration-200",
                          "hover:bg-muted/80",
                          isListening && "animate-pulse bg-red-500 hover:bg-red-600"
                        )}
                        title={!voiceSupported ? "Voice input not supported" : isListening ? "Stop listening" : "Start voice input"}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </Button>

                      {/* Send button with enhanced states */}
                      <Button
                        type="submit"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg transition-all duration-200",
                          "bg-primary hover:bg-primary/90 text-primary-foreground",
                          "shadow-sm hover:shadow-md",
                          (isTyping || !message.trim()) && "opacity-50 cursor-not-allowed",
                          message.trim() && "hover:scale-105 active:scale-95"
                        )}
                        disabled={isTyping || !message.trim()}
                        onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
                        title="Send message"
                      >
                        {isTyping ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Helpful hints - compact version */}
                  <div className="flex items-center justify-between mt-1.5 px-1 md:hidden">
                    {voiceSupported && (
                      <div className="text-[10px] text-muted-foreground">
                        Voice available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
