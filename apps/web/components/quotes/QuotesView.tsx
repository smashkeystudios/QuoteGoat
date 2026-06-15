"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useQuotes, useDeleteQuote } from "@/lib/queries/useQuotes";
import { computeQuote, fmt } from "@/lib/calc";
import s from "@/styles/components/quotes.module.css";
import b from "@/styles/components/builder.module.css";
import type { SavedQuote } from "@/lib/types";

export function QuotesView() {
  const { data: quotes = [], isLoading } = useQuotes();
  const { mutate: deleteQuote } = useDeleteQuote();
  const loadSavedQuote = useStore((st) => st.loadSavedQuote);
  const setTab = useStore((st) => st.setTab);
  const setShowShareModal = useStore((st) => st.setShowShareModal);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
      const syntheticTiers = [1, 2, 3].map((id) => ({
        id, label: `Tier ${id}`, cls: `t${id}` as "t1" | "t2" | "t3", tooltip: "",
        features: q.features
          .filter((f) => f.tier === id)
          .map((f) => ({ id: f.id, name: f.name, tip: f.tip ?? "", tierId: id, sortOrder: 0 })),
      }));
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
                  {q.info.name || "—"} · {q.info.date} · {q.ct === "handoff" ? "Handoff" : "Hosted"}
                  {q.features.length > 0 && ` · ${q.features.length} feature${q.features.length !== 1 ? "s" : ""}`}
                </div>
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
  );
}
