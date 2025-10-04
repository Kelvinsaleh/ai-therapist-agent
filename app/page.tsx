"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingDotsCentered } from "@/components/ui/loading-dots";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Ensure we always redirect to the therapy page
    const redirectToTherapy = () => {
      try {
        router.replace("/therapy");
      } catch (error) {
        console.error("Redirect failed, using window.location:", error);
        window.location.href = "/therapy";
      }
    };

    // Immediate redirect
    redirectToTherapy();
    
    // Backup redirect after a short delay
    const timeout = setTimeout(() => {
      if (window.location.pathname === "/") {
        redirectToTherapy();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <LoadingDotsCentered text="Loading AI Chat..." />
        <p className="text-sm text-muted-foreground mt-4">
          Redirecting to your AI therapy session...
        </p>
      </div>
    </div>
  );
}
