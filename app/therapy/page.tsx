"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  PlusCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createChatSession,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/utils/logger";
import { useSession } from "@/lib/contexts/session-context";

export default function TherapySessionsPage() {
  const router = useRouter();
  const { user } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load all sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        logger.debug("Loading chat sessions...");
        const allSessions = await getAllChatSessions();
        logger.debug(`Loaded ${allSessions.length} sessions`, allSessions);
        setSessions(allSessions);
      } catch (error) {
        logger.error("Failed to load sessions", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleNewSession = async () => {
    try {
      setIsCreating(true);
      const newSessionId = await createChatSession();
      logger.debug("New session created", { sessionId: newSessionId });
      
      // Navigate to the new session
      router.push(`/therapy/${newSessionId}`);
    } catch (error) {
      logger.error("Failed to create new session", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/therapy/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center ring-2 ring-primary/20 shadow-lg mx-auto mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Chat Sessions</h1>
          <p className="text-muted-foreground">
            Choose a session to continue or start a new conversation
          </p>
        </div>

        {/* New Session Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={handleNewSession}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {isCreating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <PlusCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">New Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a fresh conversation with your AI therapist
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Previous Sessions */}
        {sessions.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/40"
                    onClick={() => handleSessionClick(session.sessionId)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">
                            {session.messages[0]?.content?.slice(0, 60) || 
                             `Session ${new Date(session.createdAt).toLocaleDateString()}`}
                            {(session.messages[0]?.content?.length || 0) > 60 && "..."}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {session.messages[session.messages.length - 1]?.content ||
                              "Continue conversation"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {session.messages?.length || 0} messages
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(() => {
                                try {
                                  const date = new Date(session.updatedAt);
                                  if (isNaN(date.getTime())) return "Just now";
                                  return formatDistanceToNow(date, { addSuffix: true });
                                } catch {
                                  return "Just now";
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2">No previous sessions</p>
            <p className="text-sm text-muted-foreground">
              Start your first conversation above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

