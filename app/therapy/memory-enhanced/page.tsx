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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("memory-enhanced");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();

    if (!currentMessage || isTyping) return;

    setMessage("");
    setIsTyping(true);

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

      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message with memory context
      console.log('Sending message to AI:', currentMessage);
      const response = await sendMemoryEnhancedMessage(currentMessage);
      console.log('Received response from AI:', response);
      
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

      console.log('Created assistant message:', assistantMessage);
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
      console.log('Starting sendMemoryEnhancedMessage with:', { message, userId, sessionId });
      
      // First try the regular chat API
      try {
        console.log('Trying regular chat API first...');
        const chatResponse = await sendChatMessage(sessionId, message);
        console.log('Regular chat API response:', chatResponse);
        
        if (chatResponse.response) {
          console.log('Regular chat API succeeded, using response');
          return {
            response: chatResponse.response,
            techniques: [],
            breakthroughs: [],
            analysis: chatResponse.analysis,
            metadata: chatResponse.metadata
          };
        } else {
          console.log('Regular chat API returned no response, trying memory-enhanced');
        }
      } catch (chatError) {
        console.log('Regular chat API failed, trying memory-enhanced approach:', chatError);
      }
      
      // If regular chat fails, try memory-enhanced approach
      const userMemory = await userMemoryManager.loadUserMemory(userId);
      const context = userMemoryManager.getTherapyContext();
      const suggestions = userMemoryManager.getTherapySuggestions();

      console.log('User memory loaded:', { 
        journalEntries: userMemory.journalEntries.length,
        meditationHistory: userMemory.meditationHistory.length,
        moodPatterns: userMemory.moodPatterns.length,
        insights: userMemory.insights.length
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

      console.log('Sending request to backend service...');
      
      // Use the backend service directly instead of going through API route
      const response = await backendService.sendMemoryEnhancedMessage(requestPayload);

      console.log('Backend response:', response);

      if (!response.success) {
        console.log('Backend request failed:', response.error);
        
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          toast.error("Your session expired. Please sign in again.");
          router.push('/login');
          throw new Error('Unauthorized');
        }
        
        if (response.error?.includes('429') || response.error?.includes('rate limit')) {
          return {
            response: "I understand you'd like to continue our conversation. Please wait a moment before sending your next message.",
            techniques: [],
            breakthroughs: [],
            isRateLimit: true
          };
        }

        throw new Error(response.error || 'Failed to get response');
      }

      console.log('Backend response successful, returning data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in sendMemoryEnhancedMessage:', error);
      logger.error('Error sending memory-enhanced message:', error);
      
      // Fallback to local response generation
      console.log('Falling back to local response generation...');
      console.log('About to call generateLocalResponse with:', { message, userId });
      const localResponse = await generateLocalResponse(message, userId);
      console.log('Local response generated:', localResponse);
      return localResponse;
    }
  };

  // Fallback local response generation
  const generateLocalResponse = async (message: string, userId: string) => {
    try {
      console.log('Generating local response for:', message);
      console.log('User ID for memory loading:', userId);
      
      const userMemory = await userMemoryManager.loadUserMemory(userId);
      console.log('User memory loaded:', userMemory);
      
      const context = userMemoryManager.getTherapyContext();
      console.log('Therapy context:', context);
      
      const suggestions = userMemoryManager.getTherapySuggestions();
      console.log('Therapy suggestions:', suggestions);

      console.log('Local response context:', { 
        context: context.substring(0, 100) + '...',
        suggestions: suggestions.length,
        userMemory: {
          journalEntries: userMemory.journalEntries.length,
          meditationHistory: userMemory.meditationHistory.length,
          moodPatterns: userMemory.moodPatterns.length,
          insights: userMemory.insights.length
        }
      });

      const lowerMessage = message.toLowerCase();
      let response = "";
      let insights: string[] = [];
      let techniques: string[] = [];
      let breakthroughs: string[] = [];
      let personalizedSuggestions: string[] = [];

      // Check if user mentioned something from their journal
      if (userMemory.journalEntries.length > 0) {
        const recentEntry = userMemory.journalEntries[userMemory.journalEntries.length - 1];
        if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
          response += `I notice from your recent journal entry that you've been feeling ${recentEntry.emotionalState} (mood: ${recentEntry.mood}/6). `;
          insights.push(`Referenced recent journal mood: ${recentEntry.mood}/6`);
        }
      }

      // Check meditation history
      if (userMemory.meditationHistory.length > 0) {
        const recentMeditation = userMemory.meditationHistory[userMemory.meditationHistory.length - 1];
        if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
          response += `I see you've been practicing ${recentMeditation.type} meditation recently. `;
          if (recentMeditation.effectiveness > 0.7) {
            response += `It seems to be working well for you (effectiveness: ${Math.round(recentMeditation.effectiveness * 100)}%). `;
            techniques.push(recentMeditation.type);
          }
        }
      }

      // Add personalized suggestions
      if (suggestions.length > 0) {
        response += suggestions[0] + " ";
        personalizedSuggestions = suggestions;
      }

      // Generate contextual response based on message content
      console.log('Generating contextual response for message:', lowerMessage);
      
      if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous') || lowerMessage.includes('panic')) {
        response += "I can hear that anxiety is really affecting you right now, and I want you to know that you're not alone in this. Anxiety can feel overwhelming, but there are effective ways to manage it. Let's start with a simple grounding technique: Can you tell me 5 things you can see around you right now? This helps bring your focus to the present moment and can reduce anxious feelings.";
        techniques.push("grounding technique");
        techniques.push("mindfulness");
        console.log('Generated anxiety response');
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('hopeless')) {
        response += "I can sense that you're going through a really difficult time right now, and I want you to know that your feelings are completely valid. Depression can make everything feel heavy and overwhelming. It's important to remember that this feeling won't last forever, even though it might feel that way. Can you tell me more about what's been weighing on your mind lately? Sometimes talking about it can help lighten the load.";
        techniques.push("validation and exploration");
        techniques.push("active listening");
        console.log('Generated depression response');
      } else if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful') || lowerMessage.includes('appreciate')) {
        response += "I love that you're practicing gratitude! This is such a powerful tool for mental well-being and can really shift your perspective. Gratitude has been shown to improve mood, reduce stress, and increase overall life satisfaction. What specifically are you feeling grateful for today? I'd love to hear more about what's bringing you joy or appreciation.";
        techniques.push("gratitude practice");
        techniques.push("positive reframing");
        breakthroughs.push("Positive mindset shift");
        console.log('Generated gratitude response');
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
        response += "It sounds like you're dealing with a lot of stress right now, and I can understand how overwhelming that must feel. Stress is our body's natural response to challenges, but when it becomes chronic, it can really take a toll on our mental and physical health. Let's work together to identify what's causing the most stress and find some healthy coping strategies. What's been the biggest source of stress for you lately?";
        techniques.push("stress management");
        techniques.push("problem-solving");
        console.log('Generated stress response');
      } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
        response += "Sleep issues can really impact every aspect of our lives - our mood, energy, concentration, and overall well-being. Poor sleep can make everything else feel more difficult to handle. Let's talk about your sleep patterns and see if we can identify what might be affecting your rest. What's your typical bedtime routine like? Are there any specific thoughts or worries that keep you awake?";
        techniques.push("sleep hygiene");
        techniques.push("relaxation techniques");
        console.log('Generated sleep response');
      } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
        response += "Work can be such a significant part of our lives and identity, so when we're struggling with work-related issues, it can feel like it's affecting everything. Whether it's job stress, career uncertainty, or workplace relationships, these challenges can really impact our mental health. I'm here to help you work through whatever work situation you're dealing with. What's been the most challenging aspect of work for you recently?";
        techniques.push("work-life balance");
        techniques.push("boundary setting");
        console.log('Generated work response');
      } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
        response += "Relationships can be both our greatest source of joy and our biggest challenges. Whether it's romantic relationships, family dynamics, or friendships, these connections deeply affect our emotional well-being. It's completely normal to struggle with relationship issues - they're complex and require ongoing work. I'm here to help you navigate whatever relationship challenges you're facing. What's been the most difficult aspect of your relationships lately?";
        techniques.push("communication skills");
        techniques.push("boundary setting");
        console.log('Generated relationship response');
      } else if (lowerMessage.includes('help') || lowerMessage.includes('need') || lowerMessage.includes('support')) {
        response += "I'm so glad you reached out for help - that takes real courage and self-awareness. Seeking support is one of the most important steps you can take for your mental health. You don't have to face whatever you're going through alone. I'm here to listen, support you, and help you work through whatever challenges you're facing. Can you tell me more about what specific areas you'd like help with?";
        techniques.push("support seeking");
        techniques.push("active listening");
        console.log('Generated help response');
      } else if (lowerMessage.includes('feel') || lowerMessage.includes('feeling') || lowerMessage.includes('emotion')) {
        response += "Thank you for sharing your feelings with me. It takes real courage to open up about what you're experiencing emotionally. Our feelings are valuable information about what's happening in our lives, even when they're difficult or uncomfortable. I'm here to listen and help you process whatever emotions you're working through. What's been the most prominent feeling for you lately?";
        techniques.push("emotion regulation");
        techniques.push("active listening");
        console.log('Generated feelings response');
      } else {
        // More contextual generic response based on message length and content
        if (message.length < 20) {
          response += "I can see you've shared something brief with me, and I appreciate you reaching out. Sometimes the most important things are hard to put into words. I'm here to listen and support you, no matter how much or how little you want to share. Could you tell me more about what's on your mind? I'd love to understand better so I can help you effectively.";
        } else {
          response += "Thank you for sharing that with me. I can hear that you're going through something important, and I want you to know that I'm here to listen and support you through whatever you're experiencing. Your thoughts and feelings are valuable, and I want to help you work through them in a way that feels right for you. Can you tell me more about what's been on your mind? I'm here to listen without judgment.";
        }
        techniques.push("active listening");
        techniques.push("supportive presence");
        console.log('Generated contextual generic response');
      }

      // Add memory-based insights
      if (userMemory.insights.length > 0) {
        const recentInsight = userMemory.insights[userMemory.insights.length - 1];
        if (recentInsight.type === 'concern') {
          response += ` I've noticed this theme coming up in our conversations. Let's explore this pattern together.`;
          insights.push(`Pattern recognition: ${recentInsight.content}`);
        }
      }

      // Add helpful follow-up questions based on the topic
      if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
        response += `\n\nSome questions to consider: What triggers your anxiety most often? Have you noticed any patterns in when it occurs? What has helped you feel calmer in the past?`;
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
        response += `\n\nSome questions to reflect on: How long have you been feeling this way? Are there any activities that used to bring you joy that you might try again? What does a good day look like for you?`;
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
        response += `\n\nLet's explore this together: What are your main sources of stress right now? Are there any stressors you can control or influence? What helps you feel more centered when you're overwhelmed?`;
      } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family')) {
        response += `\n\nSome things to consider: What would you like to see improve in this relationship? How do you typically communicate when there's conflict? What boundaries might be helpful to establish?`;
      } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
        response += `\n\nLet's think about this: What aspects of work are most challenging for you? Are there any changes you could make to improve your work situation? What does work-life balance look like for you?`;
      }

      const result = {
        response,
        insights,
        techniques,
        breakthroughs,
        moodAnalysis: {
          current: userMemory.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
          trend: getMoodTrend(userMemory),
          triggers: extractTopics(message)
        },
        personalizedSuggestions
      };

      console.log('Generated local response:', result);
      return result;
    } catch (error) {
      console.error('Error generating local response:', error);
      console.error('Error stack:', error.stack);
      logger.error('Error generating local response:', error);
      return {
        response: "I'm here to support you. Your thoughts and feelings are important. Please try again in a moment.",
        techniques: [],
        breakthroughs: []
      };
    }
  };

  // Helper function for mood trend analysis
  const getMoodTrend = (userMemory: any): string => {
    if (!userMemory.moodPatterns || userMemory.moodPatterns.length < 2) {
      return 'Insufficient data for mood trend analysis';
    }

    const recent = userMemory.moodPatterns.slice(-7);
    const older = userMemory.moodPatterns.slice(-14, -7);

    if (recent.length === 0 || older.length === 0) {
      return 'Insufficient data for mood trend analysis';
    }

    const recentAvg = recent.reduce((sum: number, p: any) => sum + p.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, p: any) => sum + p.mood, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) {
      return 'Mood is improving over the past week';
    } else if (recentAvg < olderAvg - 0.5) {
      return 'Mood has declined over the past week';
    } else {
      return 'Mood has been relatively stable';
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
