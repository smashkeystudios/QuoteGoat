"use client";
import { useStore } from "@/lib/store";
import { Header } from "./Header";
import { QuickQuotesBar } from "@/components/templates/QuickQuotesBar";
import { BuilderView } from "@/components/builder/BuilderView";
import { PricingView } from "@/components/pricing/PricingView";
import { FeaturesView } from "@/components/features/FeaturesView";
import { QuotesView } from "@/components/quotes/QuotesView";
import { SaveQuoteModal } from "@/components/quotes/SaveQuoteModal";
import { ShareLinkModal } from "@/components/builder/ShareLinkModal";
import { LiveStrip } from "@/components/strip/LiveStrip";
import type { AppTab } from "@/lib/store/uiSlice";
import s from "@/styles/components/tabs.module.css";

const TABS: { id: AppTab; label: string }[] = [
  { id: "builder",  label: "Builder"  },
  { id: "pricing",  label: "Pricing"  },
  { id: "features", label: "Features" },
  { id: "quotes",   label: "Quotes"   },
];

export function DesktopShell() {
  const tab = useStore((st) => st.tab);
  const setTab = useStore((st) => st.setTab);
  const showSaveQuoteModal = useStore((st) => st.showSaveQuoteModal);
  const showShareModal = useStore((st) => st.showShareModal);

  return (
    <div className="app">
      <Header />
      <QuickQuotesBar />
      <div className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.on : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="body">
        {tab === "builder"  && <BuilderView />}
        {tab === "pricing"  && <PricingView />}
        {tab === "features" && <FeaturesView />}
        {tab === "quotes"   && <QuotesView />}
      </div>
      <footer className={s.footer}>
        <div className={s.footerBrand}>Jakomu <span>Incorporated</span></div>
        <div className={s.footerMeta}>
          QuoteGoat · Quote Management System<br />
          © {new Date().getFullYear()} Jakomu Incorporated. All rights reserved.
        </div>
      </footer>
      <LiveStrip />
      {showSaveQuoteModal && <SaveQuoteModal />}
      {showShareModal && <ShareLinkModal />}
    </div>
  );
}
