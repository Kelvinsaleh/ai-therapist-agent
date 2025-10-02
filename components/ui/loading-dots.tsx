"use client";

import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "muted" | "white";
}

export function LoadingDots({ 
  className, 
  size = "md", 
  color = "primary" 
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  };

  const colorClasses = {
    primary: "bg-primary",
    muted: "bg-muted-foreground",
    white: "bg-white"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s"
          }}
        />
      ))}
    </div>
  );
}
