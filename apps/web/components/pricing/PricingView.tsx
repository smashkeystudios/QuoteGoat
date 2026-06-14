"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import s from "@/styles/components/pricing.module.css";
import b from "@/styles/components/builder.module.css";

const HANDOFF_FIELDS: [string, string][] = [
  ["base",  "Base Contract"],
  ["tier1", "Tier I / Feature"],
  ["tier2", "Tier II / Feature"],
  ["tier3", "Tier III / Feature"],
];

const HOSTED_UP_FIELDS: [string, string][] = [
  ["base",  "Base Contract"],
  ["tier1", "Tier I / Feature"],
  ["tier2", "Tier II / Feature"],
  ["tier3", "Tier III / Feature"],
];

const HOSTED_MO_FIELDS: [string, string][] = [
  ["moBase", "Base Monthly"],
  ["mo1",    "Tier I / Feature"],
  ["mo2",    "Tier II / Feature"],
  ["mo3",    "Tier III / Feature"],
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
      // Read fresh state when timeout fires — avoids stale closure losing rapid changes
      const latest = useStore.getState().pricingConfig;
      updatePricing({ handoff: latest.handoff, hosted: latest.hosted, baseCommission: latest.baseCommission });
    }, 600);
  };

  const ho = pricingConfig.handoff as unknown as Record<string, number>;
  const hs = pricingConfig.hosted as unknown as Record<string, number>;

  return (
    <div className={s.pMain}>
      <div className={b.sh}>
        <span className={b.shNum}>—</span>
        <span className={b.shTitle}>Base Pricing</span>
        <span className={b.shTag}>Auto-saves</span>
      </div>

      <div className={s.pGrid}>
        {/* Handoff */}
        <div className={s.pSection}>
          <div className={s.pSectionHead}>Handoff</div>
          <div className={s.pSectionBody}>
            {HANDOFF_FIELDS.map(([k, l]) => (
              <div className={b.fld} key={k}>
                <label className={b.lbl}>{l}</label>
                <CurrencyInput value={ho[k] ?? 0} onChange={(v) => handleChange("handoff", k, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Hosted — Upfront */}
        <div className={s.pSection}>
          <div className={s.pSectionHead}>Hosted · Upfront</div>
          <div className={s.pSectionBody}>
            {HOSTED_UP_FIELDS.map(([k, l]) => (
              <div className={b.fld} key={k}>
                <label className={b.lbl}>{l}</label>
                <CurrencyInput value={hs[k] ?? 0} onChange={(v) => handleChange("hosted", k, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Hosted — Monthly */}
        <div className={s.pSection}>
          <div className={s.pSectionHead}>Hosted · Monthly</div>
          <div className={s.pSectionBody}>
            {HOSTED_MO_FIELDS.map(([k, l]) => (
              <div className={b.fld} key={k}>
                <label className={b.lbl}>{l}</label>
                <CurrencyInput value={hs[k] ?? 0} onChange={(v) => handleChange("hosted", k, v)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
