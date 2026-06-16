"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { cxM, trfM } from "@/lib/calc";
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

function RateSlider({ label, value, onChange, preview }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  preview: string;
}) {
  return (
    <div className={b.fld}>
      <label className={b.lbl} style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 16 }}>{value}%<span style={{ fontSize: 11, color: "var(--mut)", marginLeft: 6 }}>/ step</span></span>
      </label>
      <input
        type="range"
        min={1}
        max={60}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={s.mfrCtrlSl}
        style={{ width: "100%", marginBottom: 6 }}
      />
      <div style={{ fontSize: 11, color: "var(--mut)", letterSpacing: "0.04em" }}>{preview}</div>
    </div>
  );
}

export function PricingView() {
  const pricingConfig = useStore((st) => st.pricingConfig);
  const setBasePrice = useStore((st) => st.setBasePrice);
  const setCxRate = useStore((st) => st.setCxRate);
  const setTrfRate = useStore((st) => st.setTrfRate);
  const { mutate: updatePricing } = useUpdatePricing();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const latest = useStore.getState().pricingConfig;
      updatePricing({
        handoff: latest.handoff,
        hosted: latest.hosted,
        baseCommission: latest.baseCommission,
        cxRate: latest.cxRate,
        trfRate: latest.trfRate,
      });
    }, 600);
  };

  const handleChange = (contract: "handoff" | "hosted", key: string, val: number) => {
    setBasePrice(contract, key, val);
    flush();
  };

  const handleCxRate = (v: number) => { setCxRate(v); flush(); };
  const handleTrfRate = (v: number) => { setTrfRate(v); flush(); };

  const ho = pricingConfig.handoff as unknown as Record<string, number>;
  const hs = pricingConfig.hosted as unknown as Record<string, number>;
  const cxRate = pricingConfig.cxRate ?? 15;
  const trfRate = pricingConfig.trfRate ?? 20;

  const cxPreview = [1, 2, 3, 4, 5]
    .map((v) => `×${cxM(v, cxRate / 100).toFixed(2)}`)
    .join(" → ");
  const trfPreview = [1, 2, 3, 4, 5]
    .map((v) => `×${trfM(v, trfRate / 100).toFixed(2)}`)
    .join(" → ");

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

        {/* Complexity multiplier */}
        <div className={s.pSection}>
          <div className={s.pSectionHead}>Complexity Multiplier</div>
          <div className={s.pSectionBody}>
            <RateSlider
              label="Rate per step (levels 1–5)"
              value={cxRate}
              onChange={handleCxRate}
              preview={`Steps 1→5: ${cxPreview}`}
            />
          </div>
        </div>

        {/* Traffic multiplier */}
        <div className={s.pSection}>
          <div className={s.pSectionHead}>Traffic Multiplier</div>
          <div className={s.pSectionBody}>
            <RateSlider
              label="Rate per step (levels 1–5)"
              value={trfRate}
              onChange={handleTrfRate}
              preview={`Steps 1→5: ${trfPreview}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
