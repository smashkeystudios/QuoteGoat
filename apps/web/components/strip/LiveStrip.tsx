"use client";
import { useStore } from "@/lib/store";
import { useComputedQuote, useAllFeats, useFeatMap } from "@/lib/store/selectors";
import { fmt, cxM, trfM } from "@/lib/calc";
import s from "@/styles/components/strip.module.css";

export function LiveStrip() {
  const expanded = useStore((st) => st.stripExpanded);
  const toggleStrip = useStore((st) => st.toggleStrip);
  const ct = useStore((st) => st.ct);
  const sel = useStore((st) => st.sel);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const Q = useComputedQuote();
  const allFeats = useAllFeats();
  const featMap = useFeatMap();
  const count = sel.size;
  const selArr = Q.arr;

  return (
    <div className={s.strip}>
      {/* Collapsed bar */}
      <div className={s.stripBar}>
        <div className={s.sc} style={{ minWidth: 90 }}>
          <div className={s.scLbl}>Type</div>
          <div className={`${s.scVal}`} style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>{ct}</div>
          <div style={{ fontSize: 8, color: "#4a4540", marginTop: 2 }}>{count} feat.</div>
        </div>
        <div className={s.sc}>
          <div className={s.scLbl}>Base</div>
          <div className={s.scVal} style={{ fontSize: 16 }}>{fmt(Q.bc)}</div>
        </div>
        <div className={s.sc}>
          <div className={s.scLbl}>Features</div>
          <div className={`${s.scVal} ${s.gld}`} style={{ fontSize: 16 }}>{fmt(Q.upMod)}</div>
        </div>
        <div className={s.sc}>
          <div className={s.scLbl}>Total Upfront</div>
          <div className={`${s.scVal} ${s.acc}`}>{fmt(Q.total)}</div>
        </div>
        {ct === "hosted" && (
          <div className={s.sc}>
            <div className={s.scLbl}>Monthly</div>
            <div className={`${s.scVal} ${s.grn}`} style={{ fontSize: 16 }}>
              {fmt(Q.mo)}<span style={{ fontSize: 10, color: "#4a4640" }}>/mo</span>
            </div>
          </div>
        )}
        <div className={s.sc} style={{ minWidth: 130, flex: 1 }}>
          <div className={s.scLbl}>Selected</div>
          {count === 0 ? (
            <div className={s.stripEmpty}>none selected</div>
          ) : (
            <div className={s.scChips}>
              {selArr.map((fid) => {
                const f = allFeats.find((x) => x.id === fid);
                return <span key={fid} className={s.scChip}>{f?.name ?? fid}</span>;
              })}
            </div>
          )}
        </div>
        <button className={s.stripToggleBtn} onClick={toggleStrip}>
          <span>{expanded ? "Collapse" : "Expand"}</span>
          <span className={`${s.stripToggleArrow} ${expanded ? s.up : ""}`}>▲</span>
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className={s.stripExpanded}>
          <div className={s.expGrid}>
            <div className={s.expCell}>
              <div className={s.expLbl}>Contract Type</div>
              <div className={`${s.expVal}`} style={{ fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>{ct}</div>
            </div>
            <div className={s.expCell}>
              <div className={s.expLbl}>Complexity</div>
              <div className={s.expVal}>{cx}<span style={{ fontSize: 14, color: "#6a6560" }}>/5</span></div>
              <div className={s.expSub}>×{cxM(cx).toFixed(2)} upfront</div>
            </div>
            {ct === "hosted" && (
              <div className={s.expCell}>
                <div className={s.expLbl}>Traffic Load</div>
                <div className={s.expVal}>{trf}<span style={{ fontSize: 14, color: "#6a6560" }}>/5</span></div>
                <div className={s.expSub}>×{trfM(trf).toFixed(2)} monthly</div>
              </div>
            )}
            <div className={s.expCell}>
              <div className={s.expLbl}>Features Selected</div>
              <div className={s.expVal}>{count}</div>
            </div>
            <hr className={s.expDivider} />
            <div className={s.expCell}>
              <div className={s.expLbl}>Base Contract</div>
              <div className={s.expVal} style={{ fontSize: 18 }}>{fmt(Q.bc)}</div>
              {Q.bcCommPct > 0 && <div className={s.expSub}>incl. +{Math.round(Q.bcCommPct * 100)}% commission</div>}
            </div>
            <div className={s.expCell}>
              <div className={s.expLbl}>Features Upfront</div>
              <div className={`${s.expVal} ${s.gld}`} style={{ fontSize: 18 }}>{fmt(Q.upMod)}</div>
              {Q.delta !== 0 && <div className={s.expSub}>+{fmt(Q.delta)} commission</div>}
            </div>
            <div className={s.expCell}>
              <div className={s.expLbl}>Total Upfront</div>
              <div className={`${s.expVal} ${s.acc}`}>{fmt(Q.total)}</div>
            </div>
            {ct === "hosted" && (
              <div className={s.expCell}>
                <div className={s.expLbl}>Monthly Retainer</div>
                <div className={`${s.expVal} ${s.grn}`} style={{ fontSize: 18 }}>{fmt(Q.mo)}<span style={{ fontSize: 12, color: "#4a4540" }}>/mo</span></div>
                <div className={s.expSub}>{fmt(Q.mo * 12)}/yr</div>
              </div>
            )}
          </div>

          {/* Per-feature table */}
          {count > 0 && (
            <div className={s.expFeatTable}>
              <div className={s.expFeatHead}>
                <span>Feature</span>
                <span>Tier</span>
                <span>Comm.</span>
                <span>Final</span>
              </div>
              {selArr.map((fid) => {
                const f = allFeats.find((x) => x.id === fid);
                const tier = featMap[fid] ?? 1;
                const mod = Q.modPct(fid);
                return (
                  <div key={fid} className={s.expFeatRow}>
                    <span className={s.expFeatName}>{f?.name ?? fid}</span>
                    <span className={`${s.expFeatTier} ${tier === 1 ? s.t1 : tier === 2 ? s.t2 : s.t3}`}>T{tier}</span>
                    <span className={s.expFeatMod}>+{Math.round(mod * 100)}%</span>
                    <span className={s.expFeatPrice}>{fmt(Q.finalUp(fid))}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
