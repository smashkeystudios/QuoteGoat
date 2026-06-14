"use client";
import { useEffect, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { QuickQuotesBar } from "@/components/templates/QuickQuotesBar";
import { BuilderView } from "@/components/builder/BuilderView";
import { PricingView } from "@/components/pricing/PricingView";
import { FeaturesView } from "@/components/features/FeaturesView";
import { QuotesView } from "@/components/quotes/QuotesView";
import { SaveQuoteModal } from "@/components/quotes/SaveQuoteModal";
import { ShareLinkModal } from "@/components/builder/ShareLinkModal";
import { LiveStrip } from "@/components/strip/LiveStrip";
import type { AppTab } from "@/lib/store/uiSlice";

const TABS: AppTab[] = ["builder", "pricing", "features", "quotes"];

export function MobileShell() {
  const tab = useStore((st) => st.tab);
  const setTab = useStore((st) => st.setTab);
  const showSaveQuoteModal = useStore((st) => st.showSaveQuoteModal);
  const showShareModal = useStore((st) => st.showShareModal);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--strip-h",
        `${entry.contentRect.height}px`
      );
    });
    ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Ignore if gesture is more vertical than horizontal (user is scrolling)
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 60) return;
    const idx = TABS.indexOf(tab);
    if (dx < 0 && idx < TABS.length - 1) setTab(TABS[idx + 1]);
    if (dx > 0 && idx > 0) setTab(TABS[idx - 1]);
  }, [tab, setTab]);

  return (
    <div
      className="app"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Header />
      <QuickQuotesBar />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(56px + var(--strip-h, 50px))" }}>
        {tab === "builder"  && <BuilderView mobile />}
        {tab === "pricing"  && <PricingView />}
        {tab === "features" && <FeaturesView />}
        {tab === "quotes"   && <QuotesView />}
      </div>
      <div ref={stripRef} style={{ position: "fixed", bottom: 56, left: 0, right: 0, zIndex: 22 }}>
        <LiveStrip />
      </div>
      <MobileNav />
      {showSaveQuoteModal && <SaveQuoteModal />}
      {showShareModal && <ShareLinkModal />}
    </div>
  );
}
