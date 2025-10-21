"use client";

import React, { FormEvent, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

interface FixedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (e: FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onFocusScrollIntoView?: () => void;
  rightAccessories?: React.ReactNode;
  isPopupOpen?: boolean;
  hideFooter?: boolean;
}

export function FixedInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled,
  className,
  onFocusScrollIntoView,
  rightAccessories,
  isPopupOpen = false,
  hideFooter = false,
}: FixedInputProps) {
  const offset = useKeyboardOffset();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Auto-grow textarea height up to a sensible max
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isPopupOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isPopupOpen]);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-[60] border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "transition-all duration-300 ease-out",
        (hideFooter || isPopupOpen) && "opacity-0 pointer-events-none translate-y-full",
        className
      )}
      style={{
        bottom: `calc(var(--keyboard-offset, 0px) + env(safe-area-inset-bottom))`,
        transform: (hideFooter || isPopupOpen) ? "translateY(100%)" : "translateY(0)",
      }}
    >
      <form
        onSubmit={onSend}
        className="max-w-3xl mx-auto p-4 pt-3 flex gap-3 items-end"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocusScrollIntoView?.();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none rounded-2xl border bg-background",
            "p-3 pr-12 min-h-[44px] max-h-[200px]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            isFocused && "ring-2 ring-primary/50 border-primary/50"
          )}
          rows={1}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e as unknown as FormEvent);
            }
          }}
        />
        {rightAccessories}
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-[36px] w-[36px] rounded-xl transition-all duration-200",
            "bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20",
            (!value.trim() || disabled) && "opacity-50 cursor-not-allowed"
          )}
          disabled={!value.trim() || disabled}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}


