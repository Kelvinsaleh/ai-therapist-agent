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
  { text: "I'm feeling sad and don't know why" },
  { text: "I want to improve my relationships" },
  { text: "I'm dealing with stress at work" },
  { text: "I want to build better habits" },
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("memory-enhanced");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  // Voice controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

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
      setMessages([]);
      setIsLoading(false);
      toast.success("New session created successfully");
    } catch (error) {
      logger.error("Failed to create new session", error);
      setIsLoading(false);
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error("Session expired. Please sign in again.");
          router.push('/login');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error("Connection error. Please check your internet connection and try again.");
        } else {
          toast.error("Failed to create new session. Please try again.");
        }
      } else {
        toast.error("Failed to create new session. Please try again.");
      }
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
          try {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            setIsListening(false);
            if (isVoiceMode) {
              setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
                handleSubmit(fakeEvent);
              }, 50);
            }
          } catch (error) {
            logger.error("Error processing speech recognition result:", error);
            setIsListening(false);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          logger.error("Speech recognition error:", event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            toast.error("Microphone access denied. Please allow microphone access and try again.");
          } else if (event.error === 'no-speech') {
            toast.warning("No speech detected. Please try speaking again.");
          } else if (event.error === 'audio-capture') {
            toast.error("No microphone found. Please check your microphone connection.");
          } else {
            toast.error("Voice input error. Please try again.");
          }
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        setVoiceSupported(true);
      }
    }

    if (!voiceSupported || !recognitionRef.current) {
      toast.error("Voice input not supported on this device. Please use a modern browser with microphone support.");
      return;
    }

    if (isListening) {
      try { 
        recognitionRef.current.stop(); 
        setIsListening(false);
      } catch (error) {
        logger.error("Error stopping speech recognition:", error);
        setIsListening(false);
      }
    } else {
      if (typeof window !== 'undefined' && (window as any).speechSynthesis?.speaking) {
        (window as any).speechSynthesis.cancel();
      }
      try { 
        recognitionRef.current.start(); 
        setIsListening(true);
        toast.info("Listening... Speak now");
      } catch (error) {
        logger.error("Error starting speech recognition:", error);
        toast.error("Failed to start voice input. Please try again.");
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!isPremium) {
      toast.error("Voice features are Premium only.");
      router.push("/pricing");
      return;
    }
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error("Text-to-speech not supported on this device.");
      return;
    }
    
    try {
      // Stop any current speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to find a good voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Natural') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (isListening && recognitionRef.current) {
          try { 
            recognitionRef.current.stop(); 
            setIsListening(false);
          } catch (error) {
            logger.error("Error stopping speech recognition:", error);
          }
        }
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        if (isVoiceMode && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            logger.error("Error resuming speech recognition:", error);
          }
        }
      };
      
      utterance.onerror = (event) => {
        logger.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        toast.error("Text-to-speech error. Please try again.");
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      logger.error("Error in speakText:", error);
      toast.error("Failed to speak text. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();

    if (!currentMessage || isTyping) return;

    setMessage("");
    setIsTyping(true);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Demo mode - get real AI responses
      if (isDemoMode) {
        try {
          // Use a demo user ID for demo mode
          const demoUserId = "demo-user-123";
          
          // Send message with memory context using demo user
          const response = await sendMemoryEnhancedMessage(currentMessage, demoUserId);
          
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: response.response || "I'm here to support you. Could you tell me more about what's on your mind?",
            timestamp: new Date(),
            metadata: {
              analysis: response.analysis || {
                emotionalState: "neutral",
                riskLevel: 0,
                themes: extractTopics(currentMessage),
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

        } catch (error) {
          logger.error("Error in demo mode chat", error);
          
          // Fallback to a demo response if AI fails
          const fallbackResponse = "I'm here to support you. Your thoughts and feelings are important. Please try again in a moment.";
          
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fallbackResponse,
              timestamp: new Date(),
              metadata: {
                analysis: {
                  emotionalState: "neutral",
                  riskLevel: 0,
                  themes: extractTopics(currentMessage),
                  recommendedApproach: "supportive",
                  progressIndicators: [],
                },
                technique: "demo",
                goal: "Provide support",
                progress: {
                  emotionalState: "neutral",
                  riskLevel: 0,
                },
              },
            },
          ]);
          setIsTyping(false);
        }
        return;
      }

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

      // Send message with memory context
      const response = await sendMemoryEnhancedMessage(currentMessage);
      
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


    } catch (error) {
      logger.error("Error in chat", error);
      
      // Determine the appropriate error message based on the error type
      let errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "Your session has expired. Please sign in again to continue.";
          toast.error("Session expired. Please sign in again.");
          router.push('/login');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage = "I'm receiving many requests right now. Please wait a moment before sending another message.";
          toast.warning("Please wait a moment before sending another message.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "I'm having trouble connecting to the server. Please check your internet connection and try again.";
          toast.error("Connection error. Please check your internet connection.");
        }
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const sendMemoryEnhancedMessage = async (message: string, overrideUserId?: string) => {
    try {
      const currentUserId = overrideUserId || userId;
      const userMemory = await userMemoryManager.loadUserMemory(currentUserId);
      const context = userMemoryManager.getTherapyContext();
      const suggestions = userMemoryManager.getTherapySuggestions();

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

      const response = await fetch('/api/chat/memory-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(requestPayload)
      });

      // Graceful handling for rate limiting and auth errors
      if (response.status === 429) {
        const data = await response.json();
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
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error sending memory-enhanced message:', error);
      
      // Provide more specific error messages based on the error type
      let fallbackResponse = "I'm here to support you. Your thoughts and feelings are important. Please try again in a moment.";
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          fallbackResponse = "Your session has expired. Please sign in again to continue our conversation.";
          toast.error("Session expired. Please sign in again.");
          router.push('/login');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          fallbackResponse = "I'm receiving many requests right now. Please wait a moment before sending another message.";
          toast.warning("Please wait a moment before sending another message.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          fallbackResponse = "I'm having trouble connecting to the server. Please check your internet connection and try again.";
          toast.error("Connection error. Please check your internet connection.");
        }
      }
      
      return {
        response: fallbackResponse,
        techniques: [],
        breakthroughs: []
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
        toast.success("Session loaded successfully");
      } else {
        toast.error("Invalid session data received");
      }
    } catch (error) {
      logger.error("Failed to load session", error);
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error("Session expired. Please sign in again.");
          router.push('/login');
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          toast.error("Session not found. It may have been deleted.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error("Connection error. Please check your internet connection and try again.");
        } else {
          toast.error("Failed to load session. Please try again.");
        }
      } else {
        toast.error("Failed to load session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Add a timeout for auth loading
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        // Force stop loading after 5 seconds
        if (authLoading) {
          console.log("Auth loading timeout - forcing unauthenticated state");
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking your session...</p>
          <Button 
            variant="outline" 
            onClick={() => setIsDemoMode(true)}
            className="mt-4"
          >
            Skip to Demo Mode
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    if (isDemoMode) {
      // Demo mode - show the chat interface but with limited functionality
      return (
        <div className="min-h-screen bg-background">
          {/* Demo mode banner */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Demo Mode:</strong> Limited functionality. Sign in for full features.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDemoMode(false)}
              >
                Exit Demo
              </Button>
            </div>
          </div>

          {/* Rest of the chat interface */}
          <div className="flex h-[calc(100vh-4rem)] mt-16 gap-0">
            {/* Sessions Sidebar - Hidden in demo */}
            <div className="hidden md:block md:w-80 border-r bg-muted/30">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Demo Session
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  This is a demo session. Sign in to save your conversations.
                </p>
              </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              {/* Chat header */}
              <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">AI Therapist (Demo)</h2>
                    <p className="text-sm text-muted-foreground">
                      {messages.length} messages • Demo Mode
                    </p>
                  </div>
                </div>
              </div>

              {messages.length === 0 ? (
                // Welcome screen with suggested questions
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center space-y-6">
                      <div className="relative inline-flex flex-col items-center">
                        <motion.div
                          className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        />
                        <div className="relative flex items-center gap-3 text-3xl font-semibold">
                          <div className="relative">
                            <Bot className="w-8 h-8 text-primary" />
                            <motion.div
                              className="absolute inset-0 text-primary"
                              initial="initial"
                              animate="animate"
                              variants={glowAnimation}
                            >
                              <Bot className="w-8 h-8" />
                            </motion.div>
                          </div>
                          <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                            AI Therapist Demo
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-3 text-lg">
                          Try our AI therapist in demo mode
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 relative">
                      <motion.div
                        className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      />
                      {SUGGESTED_QUESTIONS.map((q, index) => (
                        <motion.div
                          key={q.text}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full h-auto py-6 px-8 text-left justify-start hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 text-base"
                            onClick={() => handleSuggestedQuestion(q.text)}
                          >
                            {q.text}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Chat messages
                <div className="flex-1 overflow-y-auto scroll-smooth pb-32 overscroll-contain">
                  <div className="max-w-4xl mx-auto px-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.timestamp.toISOString()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "py-6",
                            msg.role === "assistant"
                              ? "bg-muted/20"
                              : "bg-background"
                          )}
                        >
                          <div className="flex gap-4 max-w-3xl mx-auto">
                            <div className="w-10 h-10 shrink-0 mt-1">
                              {msg.role === "assistant" ? (
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                                  <Bot className="w-6 h-6" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                  <User className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-3 overflow-hidden min-h-[2.5rem]">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-base">
                                  {msg.role === "assistant"
                                    ? "AI Therapist"
                                    : "You"}
                                </p>
                                {msg.metadata?.technique && (
                                  <Badge variant="secondary" className="text-xs">
                                    {msg.metadata.technique}
                                  </Badge>
                                )}
                              </div>
                              <div className="prose prose-base dark:prose-invert leading-relaxed max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                              {msg.metadata?.goal && (
                                <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted/30 rounded-md">
                                  <strong>Goal:</strong> {msg.metadata.goal}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-6 bg-muted/20"
                      >
                        <div className="flex gap-4 max-w-3xl mx-auto px-4">
                          <div className="w-10 h-10 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="font-medium text-base">AI Therapist</p>
                            <div className="flex items-center gap-2">
                              <LoadingDots size="sm" color="primary" />
                              <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              {/* Input area */}
              <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-6 relative z-[60] sticky bottom-0 left-0 right-0">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-4xl mx-auto flex gap-4 items-end relative"
                >
                  <div className="flex-1 relative group">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => {
                        try { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); } catch {}
                      }}
                      placeholder="Share what's on your mind... (Demo Mode)"
                      className={cn(
                        "w-full resize-none rounded-2xl border bg-background",
                        "p-4 pr-24 min-h-[56px] max-h-[200px]",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
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
                      type="submit"
                      size="icon"
                      className={cn(
                        "absolute right-2 bottom-4 h-[40px] w-[40px]",
                        "rounded-xl transition-all duration-200",
                        "bg-primary hover:bg-primary/90",
                        "shadow-sm shadow-primary/20",
                        (isTyping || !message.trim()) &&
                          "opacity-50 cursor-not-allowed",
                        "group-hover:scale-105 group-focus-within:scale-105"
                      )}
                      disabled={isTyping || !message.trim()}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                      }}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
                <div className="mt-3 text-xs text-center text-muted-foreground">
                  Press <kbd className="px-2 py-1 rounded bg-muted text-xs">Enter ↵</kbd>{" "}
                  to send,
                  <kbd className="px-2 py-1 rounded bg-muted ml-1 text-xs">
                    Shift + Enter
                  </kbd>{" "}
                  for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Memory-Enhanced AI Therapy</h2>
            <p className="text-muted-foreground">
              Sign in to access your personalized AI therapist with memory of your mental health journey.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
              size="lg"
            >
              Sign In to Continue
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push("/signup")} 
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setIsDemoMode(true)} 
              className="w-full"
              size="lg"
            >
              Try Demo Mode
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Features you'll get with an account:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Personalized therapy sessions</li>
              <li>• Memory of your mental health journey</li>
              <li>• Voice interaction (Premium)</li>
              <li>• Session history and insights</li>
            </ul>
          </div>
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

      <div className="flex h-[calc(100vh-4rem)] mt-20 gap-0">
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
          {/* Chat header */}
          <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">AI Therapist with Memory</h2>
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages • Memory Enhanced
                </p>
              </div>
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
              >
                {isVoiceMode ? (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice On
                  </>
                ) : (
                  <>
                    <MicOff className="w-4 h-4" />
                    Voice Off
                  </>
                )}
              </Button>
            </div>
          </div>

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-6">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-3 text-3xl font-semibold">
                      <div className="relative">
                        <Bot className="w-8 h-8 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Bot className="w-8 h-8" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        AI Therapist with Memory
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-3 text-lg">
                      I remember our conversations and your mental health journey
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 px-8 text-left justify-start hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 text-base"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        {q.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth pb-32 overscroll-contain">
              <div className="max-w-4xl mx-auto px-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "py-6",
                        msg.role === "assistant"
                          ? "bg-muted/20"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-4 max-w-3xl mx-auto">
                        <div className="w-10 h-10 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                              <Bot className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3 overflow-hidden min-h-[2.5rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-base">
                              {msg.role === "assistant"
                                ? "AI Therapist"
                                : "You"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-base dark:prose-invert leading-relaxed max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.metadata?.goal && (
                            <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted/30 rounded-md">
                              <strong>Goal:</strong> {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 bg-muted/20"
                  >
                    <div className="flex gap-4 max-w-3xl mx-auto px-4">
                      <div className="w-10 h-10 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="font-medium text-base">AI Therapist</p>
                        <div className="flex items-center gap-2">
                          <LoadingDots size="sm" color="primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-6 relative z-[60] sticky bottom-0 left-0 right-0">
            <form
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto flex gap-4 items-end relative"
            >
              <div className="flex-1 relative group">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => {
                    try { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); } catch {}
                  }}
                  placeholder={
                    isListening 
                      ? "Listening... Speak now"
                      : "Share what's on your mind..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background",
                    "p-4 pr-24 min-h-[56px] max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
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
                    "absolute right-16 bottom-4 h-[40px] w-[40px]",
                    "rounded-xl transition-all duration-200",
                    "z-10 bg-background border",
                    isListening && "animate-pulse"
                  )}
                  title={
                    !voiceSupported
                      ? "Voice input not supported on this device"
                      : isListening
                        ? "Stop listening"
                        : "Start voice input"
                  }
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
                
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-2 bottom-4 h-[40px] w-[40px]",
                    "rounded-xl transition-all duration-200",
                    "bg-primary hover:bg-primary/90",
                    "shadow-sm shadow-primary/20",
                    (isTyping || !message.trim()) &&
                      "opacity-50 cursor-not-allowed",
                    "group-hover:scale-105 group-focus-within:scale-105"
                  )}
                  disabled={isTyping || !message.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
            <div className="mt-3 text-xs text-center text-muted-foreground">
              Press <kbd className="px-2 py-1 rounded bg-muted text-xs">Enter ↵</kbd>{" "}
              to send,
              <kbd className="px-2 py-1 rounded bg-muted ml-1 text-xs">
                Shift + Enter
              </kbd>{" "}
              for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
