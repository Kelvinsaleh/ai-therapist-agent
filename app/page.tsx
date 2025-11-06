"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Immediately send users to the Memory-Enhanced sessions list
  useEffect(() => {
    router.replace("/therapy/memory-enhanced/sessions");
  }, [router]);

  // Minimal fallback while redirecting
  return null;
}
