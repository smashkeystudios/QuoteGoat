"use client";
import { useStore } from "@/lib/store";
import { ClientDetailsSection } from "./ClientDetailsSection";
import { ContractSection } from "./ContractSection";
import { FeatureSearch } from "./FeatureSearch";
import { TierList } from "./TierList";
import { NotesSection } from "./NotesSection";
import { QuotePanel } from "./QuotePanel";
import s from "@/styles/components/builder.module.css";

interface Props {
  mobile?: boolean;
}

export function BuilderView({ mobile = false }: Props) {
  const sel = useStore((st) => st.sel);

  if (mobile) {
    return (
      <div>
        <ClientDetailsSection />
        <ContractSection />
        <div className={s.sh}>
          <span className={s.shNum}>03</span>
          <span className={s.shTitle}>Features</span>
          <span className={s.shTag}>{sel.size} selected</span>
        </div>
        <FeatureSearch />
        <TierList />
        <NotesSection />
        <div className={s.sh} style={{ marginTop: 8 }}>
          <span className={s.shNum}>05</span>
          <span className={s.shTitle}>Quote</span>
          <span className={s.shTag}>Live</span>
        </div>
        <QuotePanel />
      </div>
    );
  }

  return (
    <div className={s.builderDesktop} style={{ display: "grid" }}>
      {/* Left column */}
      <div className={s.builderLeft}>
        <ClientDetailsSection />
        <ContractSection />
        <div className={s.sh}>
          <span className={s.shNum}>03</span>
          <span className={s.shTitle}>Features</span>
          <span className={s.shTag}>{sel.size} selected</span>
        </div>
        <FeatureSearch />
        <TierList />
        <NotesSection />
      </div>

      {/* Right sticky column */}
      <div className={s.builderRight}>
        <div style={{ padding: "4px 0 0" }}>
          <div className={s.sh} style={{ paddingTop: 0 }}>
            <span className={s.shNum}>05</span>
            <span className={s.shTitle}>Quote</span>
            <span className={s.shTag}>Live</span>
          </div>
          <QuotePanel />
        </div>
      </div>
    </div>
  );
}
