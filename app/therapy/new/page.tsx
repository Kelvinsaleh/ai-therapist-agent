"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChatSession } from "@/lib/api/chat";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

export default function NewTherapyRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'creating' | 'redirecting' | 'error'>('creating');

  useEffect(() => {
    const go = async () => {
      try {
        setStatus('creating');
        const id = await createChatSession();
        setStatus('redirecting');
        
        // Small delay for smooth transition
        setTimeout(() => {
          router.replace(`/therapy/${id}`);
        }, 500);
      } catch (e) {
        setStatus('error');
        setTimeout(() => {
          router.replace(`/therapy/${Date.now()}`);
        }, 1000);
      }
    };
    go();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full mx-auto"
          />
          <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {status === 'creating' && 'Creating your therapy session...'}
            {status === 'redirecting' && 'Preparing your AI therapist...'}
            {status === 'error' && 'Setting up fallback session...'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {status === 'creating' && 'Setting up personalized AI therapy'}
            {status === 'redirecting' && 'Almost ready! Taking you to your session'}
            {status === 'error' && 'Creating backup session for you'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}


