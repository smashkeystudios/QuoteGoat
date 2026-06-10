"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { useComputedQuote } from "@/lib/store/selectors";
import { cxM, trfM, fmt, MOD_MAX } from "@/lib/calc";
import { useUpdatePricing } from "@/lib/queries/usePricing";
import { Tooltip } from "@/components/ui/Tooltip";
import s from "@/styles/components/builder.module.css";

export function ContractSection() {
  const ct = useStore((st) => st.ct);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const baseCommission = useStore((st) => st.pricingConfig.baseCommission);
  const setCt = useStore((st) => st.setCt);
  const setCx = useStore((st) => st.setCx);
  const setTrf = useStore((st) => st.setTrf);
  const setBaseCommission = useStore((st) => st.setBaseCommission);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const Q = useComputedQuote();
  const { mutate: updatePricing } = useUpdatePricing();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBaseCommission = (val: number) => {
    setBaseCommission(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePricing({ baseCommission: val });
    }, 400);
  };

  return (
    <>
      <div className={s.sh}>
        <span className={s.shNum}>02</span>
        <span className={s.shTitle}>Contract</span>
        <span className={s.shTag}>Setup</span>
      </div>
      <div className={s.blk}>
        <div className={s.blkIn}>
          {/* Contract type */}
          <div className={s.fld}>
            <label className={s.lbl}>Contract Type</label>
            <div className={s.ctog}>
              <button
                className={`${s.ctogBtn} ${ct === "handoff" ? s.on : ""}`}
                onClick={() => setCt("handoff")}
              >Handoff</button>
              <button
                className={`${s.ctogBtn} ${ct === "hosted" ? s.on : ""}`}
                onClick={() => setCt("hosted")}
              >Hosted</button>
            </div>
            <div className={s.ctDesc}>
              {ct === "handoff"
                ? "One-time delivery. Client receives full ownership of the build."
                : "Ongoing service. Upfront cost plus a calculated monthly retainer."}
            </div>
          </div>

          {/* Base commission */}
          <div className={s.fld}>
            <div className={s.slRow}>
              <span className={s.slLabel}>
                Base Commission
                <Tooltip text="Adds a commission to the base contract price only. Useful when no tier features are selected." />
              </span>
              <span className={s.slVal} style={{ fontSize: 22 }}>{baseCommission}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className={s.modPctBtn}
                onPointerDown={(e) => { e.preventDefault(); handleBaseCommission((baseCommission || 0) - 1); }}
              >−</button>
              <input
                type="range"
                className={s.sl}
                min={0} max={MOD_MAX} step={1}
                value={baseCommission || 0}
                onChange={(e) => handleBaseCommission(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <button
                className={s.modPctBtn}
                onPointerDown={(e) => { e.preventDefault(); handleBaseCommission((baseCommission || 0) + 1); }}
              >+</button>
            </div>
            {(baseCommission || 0) > 0 && (
              <div className={s.slNote}>
                Base {fmt(Q.bcRaw)} → {fmt(Q.bc)} (+{fmt(Q.bc - Q.bcRaw)})
              </div>
            )}
          </div>

          {/* Complexity */}
          <div className={s.fld}>
            <div className={s.slRow}>
              <span className={s.slLabel}>
                Complexity
                <Tooltip text="Multiplies the base upfront cost. Affects both contract types." />
              </span>
              <span className={s.slVal}>{cx}</span>
            </div>
            <div className={s.slTrack}>
              <input
                type="range"
                className={s.sl}
                min={1} max={5}
                value={cx}
                onChange={(e) => setCx(Number(e.target.value))}
              />
            </div>
            <div className={s.slEnds}><span>Simple</span><span>Standard</span><span>Complex</span></div>
            <div className={s.slNote}>×{cxM(cx).toFixed(2)} upfront multiplier</div>
          </div>

          {/* Traffic (hosted only) */}
          {ct === "hosted" && (
            <div className={s.fld}>
              <div className={s.slRow}>
                <span className={s.slLabel}>
                  Traffic Load
                  <Tooltip text="Scales monthly retainer only. Does not affect upfront pricing." />
                </span>
                <span className={s.slVal}>{trf}</span>
              </div>
              <div className={s.slTrack}>
                <input
                  type="range"
                  className={s.sl}
                  min={1} max={5}
                  value={trf}
                  onChange={(e) => setTrf(Number(e.target.value))}
                />
              </div>
              <div className={s.slEnds}><span>Light</span><span>Moderate</span><span>Heavy</span></div>
              <div className={s.pips}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`${s.pip} ${i <= trf ? s.on : ""}`} />
                ))}
              </div>
              <div className={s.slNote}>×{trfM(trf).toFixed(2)} monthly multiplier</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
