"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { LoadingDots } from "@/components/ui/loading-dots";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is signed in, redirect to AI chat
        router.replace("/therapy/memory-enhanced");
      } else {
        // User is not signed in, redirect to sign in page
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication status
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingDots size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
