"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMatchedChatHistory, sendMatchedChatMessage } from "@/lib/api/backend-service";

interface MatchedMessage {
  id?: string;
  role: "user" | "partner";
  content: string;
  timestamp?: string | Date;
}

export default function MatchedChatPage() {
  const { matchId } = useParams() as { matchId: string };
  const [messages, setMessages] = useState<MatchedMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMatchedChatHistory(matchId);
        if (res.success && Array.isArray(res.data)) {
          setMessages(res.data as MatchedMessage[]);
        }
      } catch (e) {
        // no-op
      }
    };
    load();
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setMessage("");
    const localMsg: MatchedMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, localMsg]);
    try {
      const res = await sendMatchedChatMessage(matchId, text);
      if (!res.success) {
        throw new Error(res.error || "Failed to send");
      }
    } catch (err) {
      // revert on error
      setMessages((prev) => prev.filter((m) => m !== localMsg));
      setMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Matched Chat</h1>
      <div className="border rounded-lg overflow-hidden flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSend} className="border-t p-3 flex gap-2 items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
            className="flex-1 resize-none rounded-xl border bg-background p-3 min-h-[44px] max-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}


