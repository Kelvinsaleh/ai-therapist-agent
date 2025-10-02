"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingDots } from "@/components/ui/loading-dots";

interface PageLoadingProps {
  message?: string;
  showSkeleton?: boolean;
}

export function PageLoading({
  message = "Loading...",
  showSkeleton = true
}: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <LoadingDots size="lg" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare everything for you
          </p>
        </div>

        {showSkeleton && (
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-4 w/full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
