"use client";

import React, { FormEvent, useRef, useEffect } from "react";
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
}: FixedInputProps) {
  const offset = useKeyboardOffset();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Auto-grow textarea height up to a sensible max
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-[60] border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      // Use CSS var set by the hook and safe-area inset for perfect positioning
      style={{
        bottom: `calc(var(--keyboard-offset, 0px) + env(safe-area-inset-bottom))`,
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
          onFocus={() => onFocusScrollIntoView?.()}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none rounded-2xl border bg-background",
            "p-3 pr-12 min-h-[44px] max-h-[200px]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
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


