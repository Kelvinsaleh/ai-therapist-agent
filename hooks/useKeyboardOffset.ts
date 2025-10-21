import { useEffect, useState } from "react";

/**
 * Enhanced keyboard offset hook that intelligently handles mobile keyboards
 * Returns the keyboard height in pixels for proper positioning
 */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let rafId: number | null = null;

    const updateOffset = () => {
      const visualViewport = window.visualViewport;
      
      if (visualViewport) {
        // Use visual viewport for accurate keyboard detection
        const currentViewportHeight = visualViewport.height;
        const windowHeight = window.innerHeight;
        
        // Calculate keyboard height (the difference between window and viewport)
        const keyboardHeight = windowHeight - currentViewportHeight;
        const newOffset = Math.max(0, keyboardHeight);
        
        // Update if there's a meaningful change (>5px threshold)
        if (Math.abs(newOffset - offset) > 5) {
          setOffset(newOffset);
          
          // Add/remove keyboard-open class for CSS hooks
          if (newOffset > 50) {
            document.documentElement.classList.add("keyboard-open");
          } else {
            document.documentElement.classList.remove("keyboard-open");
          }
        }
      } else {
        // Fallback for browsers without visualViewport
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        const newOffset = Math.max(0, heightDiff);
        
        if (Math.abs(newOffset - offset) > 5) {
          setOffset(newOffset);
        }
      }
    };

    const handleResize = () => {
      // Debounce with RAF for smooth updates
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateOffset);
    };

    const handleScroll = () => {
      // Handle viewport scroll events on mobile
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateOffset);
    };

    // Initialize
    updateOffset();

    // Use visualViewport for better mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleScroll);
    }
    
    // Fallback for older browsers
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleScroll);
      }
      
      window.removeEventListener("resize", handleResize);
      document.documentElement.classList.remove("keyboard-open");
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
