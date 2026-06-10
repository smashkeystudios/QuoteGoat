"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import s from "@/styles/components/pricing.module.css";
import b from "@/styles/components/builder.module.css";

const HANDOFF_FIELDS: [string, string][] = [
  ["base",  "Base Contract Price"],
  ["tier1", "Tier I — per Feature"],
  ["tier2", "Tier II — per Feature"],
  ["tier3", "Tier III — per Feature"],
];

const HOSTED_UP_FIELDS: [string, string][] = [
  ["base",  "Base Contract (Upfront)"],
  ["tier1", "Tier I — Upfront per Feature"],
  ["tier2", "Tier II — Upfront per Feature"],
  ["tier3", "Tier III — Upfront per Feature"],
];

const HOSTED_MO_FIELDS: [string, string][] = [
  ["moBase", "Monthly Base Price"],
  ["mo1",    "Tier I — Monthly per Feature"],
  ["mo2",    "Tier II — Monthly per Feature"],
  ["mo3",    "Tier III — Monthly per Feature"],
];

export function PricingView() {
  const pricingConfig = useStore((st) => st.pricingConfig);
  const setBasePrice = useStore((st) => st.setBasePrice);
  const { mutate: updatePricing } = useUpdatePricing();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (contract: "handoff" | "hosted", key: string, val: number) => {
    setBasePrice(contract, key, val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePricing({ [contract]: { ...pricingConfig[contract], [key]: val } });
    }, 500);
  };

  return (
    <div className={s.pMain}>
      <div className={b.sh}>
        <span className={b.shNum}>—</span>
        <span className={b.shTitle}>Base Pricing</span>
        <span className={b.shTag}>Both contract types</span>
      </div>
      <div style={{ marginTop: 16 }}>
        <div className={s.pCols}>
          {/* Handoff */}
          <div className={b.blk} style={{ margin: 0 }}>
            <div className={s.pBlkHead}>
              <span className={s.pBlkTitle}>Handoff</span>
            </div>
            <div className={b.blkIn}>
              {HANDOFF_FIELDS.map(([k, l]) => (
                <div className={b.fld} key={k}>
                  <label className={b.lbl}>{l}</label>
                  <CurrencyInput
                    value={(pricingConfig.handoff as unknown as Record<string, number>)[k] ?? 0}
                    onChange={(v) => handleChange("handoff", k, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hosted */}
          <div className={b.blk} style={{ margin: 0 }}>
            <div className={s.pBlkHead}>
              <span className={s.pBlkTitle}>Hosted</span>
            </div>
            <div className={b.blkIn}>
              <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 14 }}>
                Upfront
              </div>
              {HOSTED_UP_FIELDS.map(([k, l]) => (
                <div className={b.fld} key={k}>
                  <label className={b.lbl}>{l}</label>
                  <CurrencyInput
                    value={(pricingConfig.hosted as unknown as Record<string, number>)[k] ?? 0}
                    onChange={(v) => handleChange("hosted", k, v)}
                  />
                </div>
              ))}
              <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mut)", marginTop: 20, marginBottom: 14, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                Monthly
              </div>
              {HOSTED_MO_FIELDS.map(([k, l]) => (
                <div className={b.fld} key={k}>
                  <label className={b.lbl}>{l}</label>
                  <CurrencyInput
                    value={(pricingConfig.hosted as unknown as Record<string, number>)[k] ?? 0}
                    onChange={(v) => handleChange("hosted", k, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
