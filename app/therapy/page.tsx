"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  PlusCircle, 
  Loader2,
  Heart,
  Activity,
  TrendingUp,
  Calendar,
  BookOpen,
  Lightbulb,
  Send,
  Bot,
  User,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  Mic,
  MicOff,
  Settings,
  Database
} from "lucide-react";
import { LoadingDotsSmall, LoadingDotsCentered } from "@/components/ui/loading-dots";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { userMemoryManager, UserMemory } from "@/lib/memory/user-memory";
import { format } from "date-fns";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
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

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SuggestedQuestion {
  text: string;
  category: string;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { text: "How can I manage my anxiety better?", category: "anxiety" },
  { text: "I've been feeling overwhelmed lately", category: "stress" },
  { text: "Can we talk about improving sleep?", category: "sleep" },
  { text: "I need help with work-life balance", category: "balance" },
  { text: "I want to work on my self-esteem", category: "self-esteem" },
  { text: "Help me understand my emotions better", category: "emotions" },
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

export default function UnifiedTherapyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSession();
  
  // Core state
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  
  // Memory-enhanced features
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [useMemoryEnhanced, setUseMemoryEnhanced] = useState(true);
  const [memoryStats, setMemoryStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    averageSessionLength: 0,
    commonConcerns: [] as string[],
  });
  
  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // UI state
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserMemory();
      loadSessions();
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (sessionId && sessionId !== "memory-enhanced") {
      loadChatHistory();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserMemory = async () => {
    if (!userId) return;
    
    try {
      const memory = await userMemoryManager.loadUserMemory(userId);
      setUserMemory(memory);
      
      // Calculate memory stats
      const stats = {
        totalSessions: memory.therapySessions?.length || 0,
        totalMessages: memory.therapySessions?.reduce((total, session) => 
          total + (session.messages?.length || 0), 0) || 0,
        averageSessionLength: memory.therapySessions?.length > 0 
          ? memory.therapySessions.reduce((total, session) => 
              total + (session.messages?.length || 0), 0) / memory.therapySessions.length 
          : 0,
        commonConcerns: memory.concerns || [],
      };
      setMemoryStats(stats);
    } catch (error) {
      logger.error("Failed to load user memory:", error);
    }
  };

  const loadSessions = async () => {
    try {
      const allSessions = await getAllChatSessions();
      setSessions(allSessions);
    } catch (error) {
      logger.error("Failed to load sessions:", error);
    }
  };

  const loadChatHistory = async () => {
    if (!sessionId) return;
    
    try {
      const history = await getChatHistory(sessionId);
      setMessages(history);
      setShowWelcome(false);
    } catch (error) {
      logger.error("Failed to load chat history:", error);
    }
  };

  const createNewSession = async () => {
    try {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      setMessages([]);
      setShowWelcome(false);
      await loadSessions();
      toast.success("New therapy session created");
    } catch (error) {
      logger.error("Failed to create session:", error);
      toast.error("Failed to create new session");
    }
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      await createNewSession();
    }
    
    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setSessionId(selectedSessionId);
      setShowSessions(false);
    } catch (error) {
      logger.error("Failed to select session:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      let response: ChatMessage;
      
      if (useMemoryEnhanced) {
        response = await sendMemoryEnhancedMessage(currentMessage);
      } else {
        if (!sessionId) {
          const newSessionId = await createChatSession();
          setSessionId(newSessionId);
        }
        response = await sendChatMessage(sessionId, currentMessage);
      }

      setMessages(prev => [...prev, response]);

      // Update memory if using memory-enhanced mode
      if (useMemoryEnhanced && userId) {
        await userMemoryManager.addTherapySession({
          date: new Date(),
          topics: [],
          techniques: [],
          breakthroughs: [],
          concerns: [],
          goals: [],
          mood: 5,
          summary: "Therapy session",
          messages: [userMessage, response],
        });
        await loadUserMemory();
      }

    } catch (error) {
      logger.error("Failed to send message:", error);
      
      // Provide more helpful error messages based on the error type
      let errorContent = "I apologize, but I'm having trouble processing your message right now. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorContent = "Please log in to continue chatting with me. Your session may have expired.";
        } else if (error.message.includes("500") || error.message.includes("server")) {
          errorContent = "I'm experiencing some technical difficulties. Please try again in a moment.";
        } else if (error.message.includes("No response received")) {
          errorContent = "I didn't receive a proper response. Let me try to help you in a different way.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorContent = "There seems to be a connection issue. Please check your internet connection and try again.";
        }
      }
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMemoryEnhancedMessage = async (message: string) => {
    if (!userId) throw new Error("User not authenticated");

    const userMemory = await userMemoryManager.loadUserMemory(userId);
    const context = userMemoryManager.getTherapyContext();

    logger.log("Sending memory-enhanced message:", { message, userId });

    const response = await fetch('/api/chat/memory-enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        message,
        userId,
        userMemory,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Memory-enhanced message failed:", { status: response.status, error: errorData });
      throw new Error(`Failed to send message: ${response.status} ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    logger.log("Memory-enhanced response received:", data);

    // Handle different response formats
    const aiResponse = data.response || data.message || data.content || data.answer;
    
    if (!aiResponse) {
      logger.error("No AI response found in data:", data);
      
      // Provide a fallback response if the AI doesn't respond
      const fallbackResponses = [
        "I'm here to listen and help. Could you tell me more about what's on your mind?",
        "I understand you're reaching out. What would you like to talk about today?",
        "I'm ready to support you. What's been going on lately?",
        "Thank you for sharing. How can I help you feel better today?",
        "I'm listening. What's been weighing on your mind?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: randomResponse,
        timestamp: new Date(),
        metadata: { fallback: true },
      };
    }

    return {
      id: Date.now().toString(),
      role: "assistant" as const,
      content: aiResponse,
      timestamp: new Date(),
      metadata: data.metadata || data.analysis,
    };
  };

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = () => {
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      anxiety: Heart,
      stress: Activity,
      sleep: Clock,
      balance: TrendingUp,
      'self-esteem': Star,
      emotions: Smile,
    };
    const Icon = icons[category] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      anxiety: "bg-red-100 text-red-800",
      stress: "bg-orange-100 text-orange-800",
      sleep: "bg-blue-100 text-blue-800",
      balance: "bg-green-100 text-green-800",
      'self-esteem': "bg-purple-100 text-purple-800",
      emotions: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Chat Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please log in to start your AI chat session
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                variants={glowAnimation}
                initial="initial"
                animate="animate"
                className="relative"
              >
                <Brain className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">AI Chat Session</h1>
                <p className="text-sm text-muted-foreground">
                  {useMemoryEnhanced ? "Memory-Enhanced" : "Standard"} Mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Memory Mode Toggle */}
              <Button
                variant={useMemoryEnhanced ? "default" : "outline"}
                size="sm"
                onClick={() => setUseMemoryEnhanced(!useMemoryEnhanced)}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                {useMemoryEnhanced ? "Enhanced" : "Standard"}
              </Button>
              
              {/* Sessions Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessions(!showSessions)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Sessions ({sessions.length})
              </Button>
              
              {/* New Session */}
              <Button
                onClick={createNewSession}
                className="flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Memory Stats */}
            {useMemoryEnhanced && userMemory && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Chat Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span className="font-medium">{memoryStats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="font-medium">{memoryStats.totalMessages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Length:</span>
                    <span className="font-medium">{Math.round(memoryStats.averageSessionLength)}</span>
                  </div>
                  {memoryStats.commonConcerns.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Common Concerns:</p>
                      <div className="flex flex-wrap gap-1">
                        {memoryStats.commonConcerns.slice(0, 3).map((concern, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Suggested Questions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q, index) => (
                  <motion.div
                    key={q.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-auto py-2 px-3 text-left justify-start text-xs"
                      onClick={() => handleSuggestedQuestion(q.text)}
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(q.category)}
                        <span className="truncate">{q.text}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    AI Chat
                    {useMemoryEnhanced && (
                      <Badge variant="secondary" className="text-xs">
                        <Database className="w-3 h-3 mr-1" />
                        Enhanced
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {sessionId ? `Session: ${sessionId.slice(0, 8)}...` : "No active session"}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {showWelcome ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Brain className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
                        <p className="text-muted-foreground max-w-md">
                          I'm here to help you with your questions and conversations. 
                          Choose a suggested question below or start with your own message.
                        </p>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                        {SUGGESTED_QUESTIONS.map((q, index) => (
                          <motion.div
                            key={q.text}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                          >
                            <Button
                              variant="outline"
                              className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
                              onClick={() => handleSuggestedQuestion(q.text)}
                            >
                              <div className="flex items-center gap-3">
                                {getCategoryIcon(q.category)}
                                <span>{q.text}</span>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {messages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "flex gap-3",
                              msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className={cn(
                              "flex gap-3 max-w-[80%]",
                              msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}>
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                msg.role === "user" 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {msg.role === "user" ? (
                                  <User className="w-4 h-4" />
                                ) : (
                                  <Bot className="w-4 h-4" />
                                )}
                              </div>
                              <div className={cn(
                                "rounded-lg px-4 py-2",
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}>
                                <ReactMarkdown className="prose prose-sm max-w-none">
                                  {msg.content}
                                </ReactMarkdown>
                                <div className="text-xs opacity-70 mt-1">
                                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      />
                      {isListening && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={isListening ? stopListening : startListening}
                      disabled={!recognition}
                      className={cn(
                        "transition-colors",
                        isListening && "bg-red-100 text-red-600 hover:bg-red-200"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button type="submit" disabled={!message.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sessions Sidebar */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-lg z-20"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chat Sessions</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSessions(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-80px)] p-4">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Card
                    key={session.id || session.sessionId}
                    className={cn(
                      "cursor-pointer transition-colors",
                      sessionId === (session.id || session.sessionId) && "bg-primary/10 border-primary"
                    )}
                    onClick={() => handleSessionSelect(session.id || session.sessionId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Session {(session.id || session.sessionId).slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {session.messageCount || session.messages?.length || 0} msgs
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}