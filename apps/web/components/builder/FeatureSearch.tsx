"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useComputedQuote, useAllFeats } from "@/lib/store/selectors";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { fmt, MOD_MIN, MOD_MAX } from "@/lib/calc";
import s from "@/styles/components/ui.module.css";

function highlight(text: string, q: string) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function FeatureSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allFeats = useAllFeats();
  const Q = useComputedQuote();
  const tiers = useStore((st) => st.tiers);
  const sel = useStore((st) => st.sel);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const toggleFeature = useStore((st) => st.toggleFeature);
  const setMod = useStore((st) => st.setMod);
  const { mutate: updatePricing } = useUpdatePricing();

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const tierClsMap = Object.fromEntries(tiers.map((t) => [t.id, t.cls]));

  const q = query.trim().toLowerCase();
  const results = q.length === 0
    ? []
    : allFeats.filter(
        (f) => f.name.toLowerCase().includes(q) || f.tip.toLowerCase().includes(q)
      );

  const showDropdown = open && q.length > 0;
  const selectedCount = results.filter((f) => sel.has(f.id)).length;

  const handleMod = useCallback((id: string, v: number) => {
    setMod(id, v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePricing({ mods: { ...pricingConfig.mods, [id]: v } });
    }, 400);
  }, [setMod, updatePricing, pricingConfig.mods]);

  return (
    <div className={s.fsearchWrap} ref={wrapRef}>
      <div className={s.fsearchInpRow}>
        <span className={s.fsearchIcon}>⌕</span>
        <input
          className={s.fsearchInp}
          placeholder="Search features to select…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off" autoCorrect="off" spellCheck={false}
        />
        {query && (
          <button
            className={s.fsearchClear}
            onPointerDown={(e) => { e.preventDefault(); setQuery(""); setOpen(false); }}
          >×</button>
        )}
      </div>

      {showDropdown && (
        <div className={s.fsearchDropdown}>
          {results.length === 0 ? (
            <div className={s.fsearchNoResults}>No features match &quot;{query}&quot;</div>
          ) : (
            <>
              {results.map((feat) => {
                const isSel = sel.has(feat.id);
                const mod = pricingConfig.mods[feat.id] ?? 30;
                const base = Q.baseUpCx(feat.id);
                const final = Q.finalUp(feat.id);
                const tierCls = tierClsMap[feat.tierId] || "";
                const tierNum = feat.tierId;
                return (
                  <div key={feat.id}>
                    <div
                      className={`${s.fsearchItem} ${isSel ? s.sel : ""}`}
                      onPointerDown={(e) => { e.preventDefault(); toggleFeature(feat.id); }}
                    >
                      <div className={s.fsearchCb}>{isSel ? "✓" : ""}</div>
                      <div className={s.fsearchItemBody}>
                        <div className={s.fsearchItemName}>{highlight(feat.name, q)}</div>
                        <div className={s.fsearchItemSub}>
                          {isSel ? (
                            <>
                              <span style={{ textDecoration: "line-through", opacity: 0.45, marginRight: 4 }}>{fmt(base)}</span>
                              {fmt(final)}
                            </>
                          ) : (
                            <span style={{ opacity: 0.7 }}>{fmt(base)}</span>
                          )}
                        </div>
                      </div>
                      <span className={`${s.fsearchTierBadge} ${tierNum === 1 ? s.t1 : tierNum === 2 ? s.t2 : s.t3}`}>
                        T{tierNum}
                      </span>
                    </div>
                    {isSel && (
                      <div className={s.fsearchCommRow} onPointerDown={(e) => e.stopPropagation()}>
                        <span className={s.fsearchCommLabel}>Commission</span>
                        <button className={s.fsearchCommBtn} onPointerDown={(e) => { e.preventDefault(); handleMod(feat.id, mod - 1); }}>−</button>
                        <span className={s.fsearchCommPct}>+{mod}%</span>
                        <button className={s.fsearchCommBtn} onPointerDown={(e) => { e.preventDefault(); handleMod(feat.id, mod + 1); }}>+</button>
                        <input
                          type="range"
                          className={s.fsearchCommSl}
                          min={MOD_MIN} max={MOD_MAX} step={1}
                          value={mod}
                          onChange={(e) => handleMod(feat.id, Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className={s.fsearchHint}>
                {selectedCount > 0
                  ? `${selectedCount} of ${results.length} shown selected`
                  : `${results.length} result${results.length !== 1 ? "s" : ""}`}
                {" · tap row to toggle"}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
