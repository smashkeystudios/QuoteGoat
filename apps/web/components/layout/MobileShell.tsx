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
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 60) return;
    const idx = TABS.indexOf(tab);
    if (delta < 0 && idx < TABS.length - 1) setTab(TABS[idx + 1]);
    if (delta > 0 && idx > 0) setTab(TABS[idx - 1]);
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
