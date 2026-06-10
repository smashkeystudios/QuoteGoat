"use client";
import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    setIsMobile(!mq.matches);
    const fn = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return { isMobile, isDesktop: !isMobile };
}
