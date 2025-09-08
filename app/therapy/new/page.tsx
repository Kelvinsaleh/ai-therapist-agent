"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChatSession } from "@/lib/api/chat";

export default function NewTherapyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const go = async () => {
      try {
        const id = await createChatSession();
        router.replace(`/therapy/${id}`);
      } catch (e) {
        router.replace(`/therapy/${Date.now()}`);
      }
    };
    go();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}


