"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { useComputedQuote } from "@/lib/store/selectors";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { fmt } from "@/lib/calc";
import { FeatRow } from "./FeatRow";
import { Tooltip } from "@/components/ui/Tooltip";
import s from "@/styles/components/builder.module.css";

export function TierList() {
  const [openId, setOpenId] = useState<number | null>(null);
  const tiers = useStore((st) => st.tiers);
  const sel = useStore((st) => st.sel);
  const ct = useStore((st) => st.ct);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const toggleFeature = useStore((st) => st.toggleFeature);
  const setMod = useStore((st) => st.setMod);
  const Q = useComputedQuote();
  const { mutate: updatePricing } = useUpdatePricing();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMod = (id: string, v: number) => {
    setMod(id, v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePricing({ mods: { ...pricingConfig.mods, [id]: v } });
    }, 400);
  };

  return (
    <>
      {tiers.map((tier) => {
        const isOpen = openId === tier.id;
        const tierSelCount = tier.features.filter((f) => sel.has(f.id)).length;
        return (
          <div className={s.tier} key={tier.id}>
            <div
              className={`${s.tierHd} ${isOpen ? s.open : ""}`}
              onClick={() => setOpenId((prev) => (prev === tier.id ? null : tier.id))}
            >
              <span className={`${s.tierPill} ${tier.cls}`}>{tier.label}</span>
              <Tooltip text={tier.tooltip} />
              <span className={s.tierNote}>
                {fmt((pricingConfig[ct] as unknown as Record<string, number>)[`tier${tier.id}`])} upfront
                {ct === "hosted" && ` · ${fmt((pricingConfig.hosted as unknown as Record<string, number>)[`mo${tier.id}`])}/mo`}
              </span>
              {tierSelCount > 0 && (
                <span className={s.tierSelCount}>{tierSelCount} selected</span>
              )}
              <span className={`${s.tierChevron} ${isOpen ? s.open : ""}`}>▲</span>
            </div>
            <div className={`${s.tierBody} ${isOpen ? s.open : ""}`}>
              {tier.features.map((feat) => {
                const isSel = sel.has(feat.id);
                const mod = pricingConfig.mods[feat.id] ?? 30;
                const base = Q.baseUpCx(feat.id);
                const final = Q.finalUp(feat.id);
                return (
                  <FeatRow
                    key={feat.id}
                    feat={feat}
                    isSel={isSel}
                    mod={mod}
                    price={isSel ? final : base}
                    basePrice={base}
                    onToggle={() => toggleFeature(feat.id)}
                    onMod={(v) => handleMod(feat.id, v)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
