"use client";

import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "muted" | "white" | "secondary" | "destructive";
  text?: string;
  centered?: boolean;
}

export function LoadingDots({ 
  className, 
  size = "md", 
  color = "primary",
  text,
  centered = false
}: LoadingDotsProps) {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2", 
    lg: "w-3 h-3",
    xl: "w-4 h-4"
  };

  const colorClasses = {
    primary: "bg-primary",
    muted: "bg-muted-foreground",
    white: "bg-white",
    secondary: "bg-secondary",
    destructive: "bg-destructive"
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      centered && "justify-center",
      className
    )}>
      <div className="flex space-x-1">
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
      {text && (
        <span className={cn(
          "text-muted-foreground",
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function LoadingDotsSmall({ text, className, color }: { text?: string; className?: string; color?: "primary" | "muted" | "white" | "secondary" | "destructive" }) {
  return <LoadingDots size="sm" text={text} className={className} color={color} />;
}

export function LoadingDotsMedium({ text, className }: { text?: string; className?: string }) {
  return <LoadingDots size="md" text={text} className={className} />;
}

export function LoadingDotsLarge({ text, className }: { text?: string; className?: string }) {
  return <LoadingDots size="lg" text={text} className={className} />;
}

export function LoadingDotsCentered({ text, className }: { text?: string; className?: string }) {
  return <LoadingDots size="md" text={text} centered className={className} />;
}
