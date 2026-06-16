"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuotes, useDeleteQuote } from "@/lib/queries/useQuotes";
import { computeQuote, fmt, cxM, trfM } from "@/lib/calc";
import s from "@/styles/components/quotes.module.css";
import b from "@/styles/components/builder.module.css";
import type { SavedQuote } from "@/lib/types";

const TIER_COLORS: Record<number, string> = { 1: "#4a7c59", 2: "#7a6b3a", 3: "#6b3a4a" };
const TIER_BG: Record<number, string>     = { 1: "#1a2e20", 2: "#2a2010", 3: "#2a1020" };

function fmtSavedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function buildSyntheticTiers(q: SavedQuote) {
  return [1, 2, 3].map((id) => ({
    id, label: `Tier ${id}`, cls: `t${id}` as "t1" | "t2" | "t3", tooltip: "",
    features: q.features
      .filter((f) => f.tier === id)
      .map((f) => ({ id: f.id, name: f.name, tip: f.tip ?? "", tierId: id, sortOrder: 0 })),
  }));
}

function InternalPreviewModal({ q, onClose }: { q: SavedQuote; onClose: () => void }) {
  const tiers = buildSyntheticTiers(q);
  const Q = computeQuote({ ct: q.ct, sel: new Set(q.sel), cx: q.cx, trf: q.trf, config: q.pricingSnapshot, tiers });

  const featureMap = Object.fromEntries(q.features.map((f) => [f.id, f]));
  const hasMonthly = q.ct === "hosted" && Q.mo > 0;
  const ctLabel = q.ct === "handoff" ? "Handoff" : "Hosted Retainer";
  const commPctDisplay = `${(Q.bcCommPct * 100).toFixed(0)}%`;
  const effectiveMargin = Q.total > 0 ? ((Q.delta / Q.total) * 100).toFixed(1) : "0.0";
  const cxRate = (q.pricingSnapshot.cxRate ?? 15) / 100;
  const trfRate = (q.pricingSnapshot.trfRate ?? 20) / 100;
  const lcv = (months: number) => Q.total + Q.mo * months;

  return (
    <div className={s.previewBackdrop} onClick={onClose}>
      <div className={s.previewModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.previewHeader}>
          <div>
            <div className={s.previewBanner}>⚠ INTERNAL — Not for client distribution</div>
            <div className={s.previewTitle}>{q.info.project || "Project"}</div>
            <div className={s.previewSub}>{q.info.name || "Client"} · {ctLabel} · {fmtSavedAt(q.savedAt)}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className={s.previewTotalLbl}>Total Client Price</div>
            <div className={s.previewTotalAmt}>{fmt(Q.total)}</div>
            {hasMonthly && <div className={s.previewMo}>{fmt(Q.mo)}<span style={{ fontSize: 12, color: "var(--mut)" }}>/mo</span></div>}
          </div>
          <button className={s.previewClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.previewBody}>
          {/* Two-col: stats + table */}
          <div className={s.previewCols}>
            {/* Left stats */}
            <div className={s.previewLeft}>
              <div className={s.previewPanelLbl}>Commission Breakdown</div>
              {[
                ["Base Commission", commPctDisplay, "gld"],
                ["Base (before comm.)", fmt(Q.bcRaw), ""],
                ["Base (client price)", fmt(Q.bc), "acc"],
                ["Features (no modifier)", fmt(Q.upBase), ""],
                ["Features (with modifiers)", fmt(Q.upMod), "acc"],
                ["Modifier Revenue", fmt(Q.delta), "gld"],
                ["Effective Margin", `${effectiveMargin}%`, "gld"],
              ].map(([lbl, val, cls]) => (
                <div key={lbl as string} className={s.previewStatRow}>
                  <span className={s.previewStatLbl}>{lbl}</span>
                  <span className={`${s.previewStatVal} ${cls ? s[cls as string] : ""}`}>{val}</span>
                </div>
              ))}

              <div className={s.previewPanelLbl} style={{ marginTop: 16 }}>Quote Settings</div>
              {[
                ["Complexity", `${q.cx} (×${cxM(q.cx, cxRate).toFixed(2)})`],
                ["Traffic", `${q.trf} (×${trfM(q.trf, trfRate).toFixed(2)})`],
                ["Features", `${q.sel.length} selected`],
              ].map(([lbl, val]) => (
                <div key={lbl as string} className={s.previewStatRow}>
                  <span className={s.previewStatLbl}>{lbl}</span>
                  <span className={s.previewStatVal}>{val}</span>
                </div>
              ))}

              {hasMonthly && (
                <>
                  <div className={s.previewPanelLbl} style={{ marginTop: 16 }}>LCV Projections</div>
                  <div className={s.lcvGrid}>
                    {[["1yr", 12], ["2yr", 24], ["3yr", 36], ["5yr", 60]].map(([label, months]) => (
                      <div key={label as string} className={s.lcvCell}>
                        <div className={s.lcvYr}>{label}</div>
                        <div className={s.lcvAmt}>{fmt(lcv(months as number))}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {q.notes && q.notes.filter(Boolean).length > 0 && (
                <>
                  <div className={s.previewPanelLbl} style={{ marginTop: 16 }}>Notes</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {q.notes.filter(Boolean).map((n, i) => (
                      <li key={i} style={{ fontSize: 12, color: "var(--mut)", paddingBottom: 6, display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--acc)" }}>•</span>{n}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Right: feature table */}
            <div className={s.previewRight}>
              <div className={s.previewPanelLbl}>Investment Breakdown</div>
              <table className={s.previewTbl}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th className={s.right}>Base ×cx</th>
                    <th className={s.right}>Mod</th>
                    <th className={s.right}>Comm.</th>
                    <th className={s.right}>Client $</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={s.baseRow}>
                    <td><strong>Base Contract</strong></td>
                    <td className={s.right} style={{ color: "var(--mut)", fontSize: 13 }}>{fmt(Q.bcRaw)}</td>
                    <td className={s.right} style={{ color: "var(--mut)", fontSize: 13 }}>{commPctDisplay}</td>
                    <td className={s.right} style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 16 }}>{fmt(Q.bc - Q.bcRaw)}</td>
                    <td className={s.right} style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{fmt(Q.bc)}</td>
                  </tr>
                  {q.sel.map((fid) => {
                    const f = featureMap[fid];
                    const tierNum = f?.tier ?? 1;
                    const base = Q.baseUpCx(fid);
                    const mod = Q.modPct(fid);
                    const final = Q.finalUp(fid);
                    const moPrice = hasMonthly ? Q.moFeat(fid) : 0;
                    const modDisplay = mod >= 0 ? `+${(mod * 100).toFixed(0)}%` : `${(mod * 100).toFixed(0)}%`;
                    return (
                      <tr key={fid} className={s.previewFeatRow}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{
                              display: "inline-block", padding: "1px 7px", fontSize: 10,
                              background: TIER_BG[tierNum], color: TIER_COLORS[tierNum],
                              marginBottom: 2,
                            }}>{f?.tierLabel ?? `Tier ${tierNum}`}</span>
                            <span style={{ fontSize: 13 }}>{f?.name ?? fid}</span>
                            {moPrice > 0 && <span style={{ fontSize: 11, color: "var(--grn)" }}>{fmt(moPrice)}/mo</span>}
                          </div>
                        </td>
                        <td className={s.right} style={{ color: "var(--mut)", fontSize: 13 }}>{fmt(base)}</td>
                        <td className={s.right} style={{ color: "var(--mut)", fontSize: 13 }}>{modDisplay}</td>
                        <td className={s.right} style={{ color: "var(--gold)", fontFamily: "var(--serif)", fontSize: 16 }}>{fmt(final - base)}</td>
                        <td className={s.right} style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{fmt(final)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className={s.previewTotals}>
                <div className={s.previewTotalRow}>
                  <span>Without commission</span>
                  <span>{fmt(Q.totalNoMod)}</span>
                </div>
                <div className={s.previewTotalRow} style={{ color: "var(--gold)" }}>
                  <span>Commission revenue</span>
                  <span>{fmt(Q.delta)}</span>
                </div>
                <div className={s.previewTotalRow} style={{ color: "var(--acc)", fontSize: 20, fontFamily: "var(--serif)", borderTop: "2px solid var(--acc)", paddingTop: 8, marginTop: 4 }}>
                  <span>Total client price</span>
                  <span>{fmt(Q.total)}</span>
                </div>
                {hasMonthly && (
                  <div className={s.previewTotalRow} style={{ color: "var(--grn)" }}>
                    <span>Monthly retainer</span>
                    <span>{fmt(Q.mo)}/mo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuotesView() {
  const { data: quotes = [], isLoading } = useQuotes();
  const { mutate: deleteQuote } = useDeleteQuote();
  const loadSavedQuote = useStore((st) => st.loadSavedQuote);
  const setTab = useStore((st) => st.setTab);
  const setShowShareModal = useStore((st) => st.setShowShareModal);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<SavedQuote | null>(null);

  const handleLoad = (q: SavedQuote) => {
    loadSavedQuote(q);
    setTab("builder");
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteQuote(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleDownload = async (q: SavedQuote, type: "client" | "internal") => {
    const pdfUrl = process.env.NEXT_PUBLIC_PDF_SERVICE_URL;
    if (!pdfUrl) return alert("PDF service not configured.");
    try {
      const syntheticTiers = buildSyntheticTiers(q);
      const Q = computeQuote({
        ct: q.ct,
        sel: new Set(q.sel),
        cx: q.cx,
        trf: q.trf,
        config: q.pricingSnapshot,
        tiers: syntheticTiers,
      });
      const res = await fetch(`${pdfUrl}/pdf/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteInfo: q.info,
          contractType: q.ct,
          complexity: q.cx,
          traffic: q.trf,
          quoteId: q.id,
          validityDays: 30,
          computed: {
            bc: Q.bc, bcRaw: Q.bcRaw, bcCommPct: Q.bcCommPct,
            upMod: Q.upMod, upBase: Q.upBase, mo: Q.mo,
            moBase: Q.moBase, moFeats: Q.moFeats,
            total: Q.total, totalNoMod: Q.totalNoMod, delta: Q.delta,
          },
          featureRows: q.features.map((f) => ({
            id: f.id, name: f.name, tip: f.tip,
            tier: f.tier, tierLabel: f.tierLabel,
            basePrice: Q.baseUpCx(f.id),
            commission: Q.modPct(f.id) * 100,
            finalPrice: Q.finalUp(f.id),
            monthlyPrice: q.ct === "hosted" ? Q.moFeat(f.id) : undefined,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${q.info.project || "quote"}_${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed. PDF service may be starting up.");
    }
  };

  if (isLoading) {
    return <div className={s.qvEmpty}>Loading quotes…</div>;
  }

  if (quotes.length === 0) {
    return (
      <div className={s.qvEmpty}>
        <div className={s.qvEmptyIcon}>⊡</div>
        <div className={s.qvEmptyTitle}>No saved quotes yet</div>
        <div className={s.qvEmptySub}>Build a quote in the Builder tab and click "Save Quote" to store it here.</div>
      </div>
    );
  }

  return (
    <>
      {preview && <InternalPreviewModal q={preview} onClose={() => setPreview(null)} />}
      <div className={s.qvMain}>
        <div className={b.sh}>
          <span className={b.shNum}>—</span>
          <span className={b.shTitle}>Saved Quotes</span>
          <span className={b.shTag}>{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</span>
        </div>
        <div className={s.qvList}>
          {quotes.map((q) => (
            <div key={q.id} className={s.qvCard}>
              <div className={s.qvCardHead}>
                <div>
                  <div className={s.qvProject}>{q.info.project || "Untitled"}</div>
                  <div className={s.qvMeta}>
                    {q.info.name || "—"} · {q.ct === "handoff" ? "Handoff" : "Hosted"}
                    {q.features.length > 0 && ` · ${q.features.length} feat.`}
                    {q.notes && q.notes.filter(Boolean).length > 0 && ` · ${q.notes.filter(Boolean).length} note${q.notes.filter(Boolean).length !== 1 ? "s" : ""}`}
                  </div>
                  <div className={s.qvTimestamp}>{fmtSavedAt(q.savedAt)}</div>
                </div>
                <div className={s.qvTotals}>
                  <div className={s.qvTotal}>{fmt(q.computed.total)}</div>
                  {q.ct === "hosted" && q.computed.mo > 0 && (
                    <div className={s.qvMo}>{fmt(q.computed.mo)}/mo</div>
                  )}
                </div>
              </div>
              <div className={s.qvActions}>
                <button className={`${b.qbtn} ${b.qbtnP}`} onClick={() => handleLoad(q)}>
                  Load
                </button>
                <button className={`${b.qbtn} ${b.qbtnI}`} onClick={() => setPreview(q)}>
                  Preview
                </button>
                <button className={`${b.qbtn} ${b.qbtnI}`} onClick={() => handleDownload(q, "client")}>
                  Client PDF
                </button>
                <button className={`${b.qbtn} ${b.qbtnI}`} onClick={() => handleDownload(q, "internal")}>
                  Internal PDF
                </button>
                <button className={`${b.qbtn} ${b.qbtnI}`} onClick={() => setShowShareModal(true, q.id)}>
                  Share
                </button>
                <button
                  className={`${b.qbtn} ${b.qbtnI}`}
                  style={{ color: confirmDelete === q.id ? "var(--acc)" : undefined }}
                  onClick={() => handleDelete(q.id)}
                >
                  {confirmDelete === q.id ? "Confirm Delete" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
