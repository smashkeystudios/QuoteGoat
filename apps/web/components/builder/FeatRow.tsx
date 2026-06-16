"use client";
import { memo } from "react";
import { fmt, MOD_MIN, MOD_MAX } from "@/lib/calc";
import { Tooltip } from "@/components/ui/Tooltip";
import s from "@/styles/components/builder.module.css";
import type { Feature } from "@/lib/types";

interface Props {
  feat: Feature;
  isSel: boolean;
  mod: number;
  price: number;
  basePrice: number;
  onToggle: () => void;
  onMod: (v: number) => void;
}

export const FeatRow = memo(function FeatRow({ feat, isSel, mod, price, basePrice, onToggle, onMod }: Props) {
  const hasModEffect = price !== basePrice;
  return (
    <div className={`${s.featCard} ${isSel ? s.on : ""}`}>
      <div className={s.feat} onClick={onToggle}>
        <div className={s.featCb}>{isSel ? "✓" : ""}</div>
        <div className={s.featBody}>
          <div className={s.featName}>{feat.name}</div>
          {!isSel && (
            <div className={s.featSub}>
              <span style={{ opacity: 0.55 }}>{fmt(basePrice)}</span>
            </div>
          )}
          {isSel && hasModEffect && (
            <div className={s.featSub}>
              <span style={{ textDecoration: "line-through", opacity: 0.45, marginRight: 5 }}>{fmt(basePrice)}</span>
              +{mod}%
            </div>
          )}
        </div>
        <div className={s.featRight}>
          <div className={s.featPrice}>{fmt(price)}</div>
          {isSel && hasModEffect && <span className={s.modTag}>+{mod}%</span>}
        </div>
        {feat.tip && <Tooltip text={feat.tip} />}
      </div>
      {isSel && (
        <div className={s.featModRow} onClick={(e) => e.stopPropagation()}>
          <span className={s.modLabel}>Commission</span>
          <button className={s.modPctBtn} onPointerDown={(e) => { e.preventDefault(); onMod(mod - 1); }}>−</button>
          <span className={s.modPctDisplay}>+{mod}%</span>
          <button className={s.modPctBtn} onPointerDown={(e) => { e.preventDefault(); onMod(mod + 1); }}>+</button>
          <input
            type="range"
            className={s.modSl}
            min={MOD_MIN} max={MOD_MAX} step={1}
            value={mod}
            onChange={(e) => onMod(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
});
