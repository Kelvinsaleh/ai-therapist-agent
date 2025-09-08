"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { checkSessionLimit, getUserLimits } from "@/lib/session-limits";
import { toast } from "sonner";

export function StartSessionModal() {
  const router = useRouter();
  const { user, isAuthenticated } = useSession();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("text");
  const [error, setError] = useState<string>("");
  const [userTier, setUserTier] = useState<"free" | "premium">("free");

  const handleStartSession = async () => {
    try {
      // Check session limits for free users
      if (userTier === "free") {
        // Mock current session counts - in real app, get from backend
        const currentSessionsThisWeek = 2; // This would come from backend
        const currentSessionsToday = 0; // This would come from backend
        
        const limitCheck = checkSessionLimit(userTier, currentSessionsThisWeek, currentSessionsToday);
        
        if (!limitCheck.canStart) {
          toast.error(limitCheck.reason);
          setError(limitCheck.reason || "Session limit reached");
          return;
        }
      }

      // Handle different session types
      if (type === "audio") {
        const limits = getUserLimits(userTier);
        if (!limits.canUseVoice) {
          toast.error("Voice therapy is a premium feature. Upgrade to access voice sessions.");
          setError("Voice therapy requires Premium subscription");
          return;
        }
        setOpen(false);
        router.push(`/therapy/343`);
        return;
      }
      
      if (type !== "text") {
        setError("This session type is coming soon. Please select Text Chat.");
        return;
      }

      setOpen(false);
      // Redirect to the therapy chat page with a static session ID
      router.push(`/therapy/343`);
    } catch (error) {
      console.error("Failed to start session:", error);
      setError("Failed to start session. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2 w-full">
          <MessageSquare className="w-4 h-4" />
          Start Therapy Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label>Session Type</label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="video"
                  className="flex items-center justify-between"
                >
                  Video Call
                  <span className="text-xs text-muted-foreground ml-2">
                    (Coming Soon)
                  </span>
                </SelectItem>
                <SelectItem value="audio">Voice Chat</SelectItem>
                <SelectItem value="text">Text Chat</SelectItem>
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          
          {/* Session Limits Display */}
          {userTier === "free" && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">Free Plan Limits</span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <div>• 3 therapy sessions per week</div>
                <div>• 1 session per day</div>
                <div>• 30 minutes max per session</div>
                <div>• Basic voice features</div>
              </div>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade to Premium for Unlimited Sessions
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStartSession}>Start Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
