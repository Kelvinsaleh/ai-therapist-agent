"use client";

import { useEffect, useState } from "react";

/**
 * useKeyboardOffset
 * - Returns the current keyboard height in pixels (0 when closed or not detected).
 * - Sets CSS variable --keyboard-offset on document.documentElement for CSS usage as well.
 */
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const safeSet = (value: number) => {
      const clamped = Math.max(0, Math.round(value));
      setOffset(clamped);
      root.style.setProperty("--keyboard-offset", `${clamped}px`);
      if (clamped > 0) {
        root.classList.add("keyboard-open");
      } else {
        root.classList.remove("keyboard-open");
      }
    };

    const vv = (window as any).visualViewport as VisualViewport | undefined;
    let lastHeight = vv?.height ?? window.innerHeight;

    const computeFromVisualViewport = () => {
      if (!vv) return;
      const layoutHeight = window.innerHeight;
      const keyboard = Math.max(0, layoutHeight - vv.height - (vv.offsetTop || 0));
      safeSet(keyboard);
      lastHeight = vv.height;
    };

    const computeFromResize = () => {
      const current = window.innerHeight;
      // Heuristic: difference from initial innerHeight suggests keyboard.
      const baseline = (window as any).__baselineInnerHeight || current;
      (window as any).__baselineInnerHeight = baseline;
      const diff = Math.max(0, baseline - current);
      safeSet(diff);
      lastHeight = current;
    };

    if (vv) {
      computeFromVisualViewport();
      vv.addEventListener("resize", computeFromVisualViewport);
      vv.addEventListener("scroll", computeFromVisualViewport);
    }

    // Fallbacks for older browsers/iOS
    window.addEventListener("resize", computeFromResize);
    window.addEventListener("orientationchange", computeFromResize);

    // Initial compute for fallback
    if (!vv) computeFromResize();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", computeFromVisualViewport);
        vv.removeEventListener("scroll", computeFromVisualViewport);
      }
      window.removeEventListener("resize", computeFromResize);
      window.removeEventListener("orientationchange", computeFromResize);
      root.style.removeProperty("--keyboard-offset");
      root.classList.remove("keyboard-open");
    };
  }, []);

  return offset;
}


