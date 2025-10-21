import { useEffect, useState } from "react";

/**
 * Enhanced keyboard offset hook that intelligently handles mobile keyboards
 * Returns the keyboard height in pixels for proper positioning
 */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialHeight = window.innerHeight;
    let rafId: number | null = null;

    const updateOffset = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const newOffset = Math.max(0, initialHeight - currentHeight);
      
      // Only update if there's a significant change (>10px) to avoid jitter
      if (Math.abs(newOffset - offset) > 10) {
        setOffset(newOffset);
      }
    };

    const handleResize = () => {
      // Use RAF to debounce rapid resize events
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateOffset);
    };

    const handleFocus = () => {
      initialHeight = window.innerHeight;
      handleResize();
    };

    const handleBlur = () => {
      // Smooth transition back to 0 when keyboard closes
      rafId = requestAnimationFrame(() => {
        setOffset(0);
      });
    };

    // Use visualViewport if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
    }

    // Track focus/blur on inputs
    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      } else {
        window.removeEventListener("resize", handleResize);
      }
      
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
    };
  }, [offset]);

  // Set CSS variable for use in components
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--keyboard-offset",
        `${offset}px`
      );
    }
  }, [offset]);

  return offset;
}
