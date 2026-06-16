"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useComputedQuote, useAllFeats } from "@/lib/store/selectors";
import { fmt } from "@/lib/calc";
import s from "@/styles/components/builder.module.css";

const TIER_LABELS: Record<number, string> = { 1: "Tier I", 2: "Tier II", 3: "Tier III" };

export function QuotePanel() {
  const [pdfLoading, setPdfLoading] = useState<null | "client" | "internal">(null);
  const ct = useStore((st) => st.ct);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const royalty = useStore((st) => st.royalty);
  const info = useStore((st) => st.info);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const setShowSaveQuoteModal = useStore((st) => st.setShowSaveQuoteModal);
  const setShowShareModal    = useStore((st) => st.setShowShareModal);
  const shareQuoteId = useStore((st) => st.shareQuoteId);
  const Q = useComputedQuote();
  const allFeats = useAllFeats();

  const buildPayload = (quoteId?: string) => ({
    quoteInfo: info,
    contractType: ct,
    complexity: cx,
    traffic: trf,
    quoteId,
    validityDays: 30,
    computed: {
      bc: Q.bc, bcRaw: Q.bcRaw, bcCommPct: Q.bcCommPct,
      upMod: Q.upMod, upBase: Q.upBase, mo: Q.mo,
      moBase: Q.moBase, moFeats: Q.moFeats,
      total: Q.total, totalNoMod: Q.totalNoMod, delta: Q.delta,
    },
    featureRows: Q.arr.map((fid) => {
      const f = allFeats.find((x) => x.id === fid);
      return {
        id: fid,
        name: f?.name ?? fid,
        tier: f?.tierId ?? 1,
        tierLabel: TIER_LABELS[f?.tierId ?? 1] ?? "Tier I",
        tip: f?.tip ?? "",
        basePrice: Q.baseUpCx(fid),
        commission: Q.modPct(fid) * 100,
        finalPrice: Q.finalUp(fid),
        monthlyPrice: ct === "hosted" ? Q.moFeat(fid) : undefined,
      };
    }),
  });

  const buildFeatureSnapshot = () =>
    Q.arr.map((fid) => {
      const f = allFeats.find((x) => x.id === fid);
      return { id: fid, name: f?.name ?? fid, tip: f?.tip ?? "", tier: f?.tierId ?? 1, tierLabel: TIER_LABELS[f?.tierId ?? 1] ?? "Tier I" };
    });

  const autoSave = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          info,
          ct, cx, trf, royalty,
          sel: Q.arr,
          features: buildFeatureSnapshot(),
          pricingSnapshot: pricingConfig,
          computed: { total: Q.total, mo: Q.mo, moFinal: Q.moFinal, bc: Q.bc, delta: Q.delta },
        }),
      });
      if (!res.ok) return null;
      const quote = await res.json();
      return quote.id as string;
    } catch {
      return null;
    }
  };

  const downloadPdf = async (endpoint: "client" | "internal") => {
    const pdfUrl = process.env.NEXT_PUBLIC_PDF_SERVICE_URL;
    if (!pdfUrl) {
      alert("PDF service not configured. Set NEXT_PUBLIC_PDF_SERVICE_URL.");
      return;
    }
    setPdfLoading(endpoint);
    try {
      const savedId = shareQuoteId ?? (await autoSave());

      const res = await fetch(`${pdfUrl}/pdf/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(savedId ?? undefined)),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();

      if (savedId) {
        const arrayBuf = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        }
        const blobB64 = btoa(binary);
        await fetch(`/api/quotes/${savedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [`${endpoint}PdfB64`]: blobB64 }),
        }).catch(() => {});
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${info.project || "quote"}_${endpoint}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed.\n\nThe PDF service runs on a free tier and may need ~30 seconds to wake up after inactivity. Please wait a moment and try again.");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleShare = useCallback(() => {
    if (shareQuoteId) {
      setShowShareModal(true, shareQuoteId);
      return;
    }
    // No saved quote yet — open Save modal first; it will chain into Share modal
    setShowSaveQuoteModal(true, true);
  }, [shareQuoteId, setShowShareModal, setShowSaveQuoteModal]);

  const busy = pdfLoading !== null;

  return (
    <div className={s.quoteCard}>
      <div className={s.qHead}>
        <div>
          <div className={s.qTitle}>Proposed Quote</div>
          <div className={s.qSub}>{info.project || "Untitled"} · {info.name || "—"}</div>
        </div>
        <div className={s.qCtBadge}>{ct}</div>
      </div>
      <div className={s.qBody}>
        {/* Base contract */}
        <div className={s.ql}>
          <div className={s.qlName}>
            <b>Base Contract</b>
            {Q.bcCommPct > 0 && (
              <span style={{ display: "block", fontSize: 10, color: "var(--mut)", marginTop: 1 }}>
                base {fmt(Q.bcRaw)} · +{Math.round(Q.bcCommPct * 100)}% commission
              </span>
            )}
          </div>
          <div className={s.qlAmt}>{fmt(Q.bc)}</div>
        </div>

        {/* Feature lines */}
        {Q.arr.length === 0 ? (
          <div className={s.qEmpty}>Select features to build your quote…</div>
        ) : (
          Q.arr.map((fid) => {
            const f = allFeats.find((x) => x.id === fid);
            const base = Q.baseUpCx(fid);
            const fin = Q.finalUp(fid);
            const diff = fin !== base;
            return (
              <div key={fid} className={s.ql}>
                <div className={s.qlName}>
                  {f?.name ?? fid}
                  {diff && (
                    <span style={{ display: "block", fontSize: 10, color: "var(--mut)", marginTop: 1 }}>
                      base {fmt(base)} · +{(Q.modPct(fid) * 100) | 0}%
                    </span>
                  )}
                </div>
                <div className={s.qlAmt}>{fmt(fin)}</div>
              </div>
            );
          })
        )}

        <hr className={s.qDiv} />

        {/* Total */}
        <div className={s.qTotalRow}>
          <span className={s.qTotalLbl}>Total Upfront</span>
          <span className={s.qTotalAmt}>{fmt(Q.total)}</span>
        </div>

        {/* Monthly (hosted) */}
        {ct === "hosted" && Q.mo > 0 && (
          <>
            <div className={s.qMoRow}>
              <span className={s.qMoLbl}>Monthly Retainer</span>
              <div style={{ textAlign: "right" }}>
                <span className={s.qMoAmt}>
                  {fmt(Q.moFinal)}<span style={{ fontSize: 13, color: "var(--mut)" }}>/mo</span>
                </span>
                {Q.royaltyAmt > 0 && (
                  <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 2 }}>
                    incl. {fmt(Q.royaltyAmt)} royalty ({royalty}%)
                  </div>
                )}
                {Q.moBase > 0 && (
                  <div style={{ fontSize: 10, color: "var(--mut)", marginTop: 1 }}>
                    base {fmt(Q.moBase)} · feats {fmt(Q.moFeats)}
                  </div>
                )}
              </div>
            </div>
            {/* LCV */}
            <div style={{ borderTop: "1px dashed var(--line2)", marginTop: 8, paddingTop: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 7 }}>
                LCV Projection
              </div>
              {[1, 2, 3, 5].map((yr) => (
                <div key={yr} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0", borderBottom: yr === 5 ? "none" : "1px solid var(--line)" }}>
                  <span style={{ fontSize: 10, color: yr === 5 ? "var(--grn)" : "var(--mut)" }}>
                    {yr}yr
                  </span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: yr === 5 ? 16 : 13, color: yr === 5 ? "var(--grn)" : "var(--ink)" }}>
                    {fmt(Q.total + Q.moFinal * 12 * yr)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PDF buttons */}
        <div className={s.qBtns}>
          <button
            className={`${s.qbtn} ${s.qbtnP}`}
            onClick={() => downloadPdf("client")}
            disabled={busy}
          >
            {pdfLoading === "client" ? "Generating…" : "↓ Client PDF"}
          </button>
          <button
            className={`${s.qbtn} ${s.qbtnI}`}
            onClick={() => downloadPdf("internal")}
            disabled={busy}
          >
            {pdfLoading === "internal" ? "Generating…" : "Internal PDF"}
          </button>
        </div>

        {/* Save + Share buttons */}
        <div className={s.qBtns} style={{ marginTop: 8 }}>
          <button
            className={`${s.qbtn} ${s.qbtnI}`}
            onClick={() => setShowSaveQuoteModal(true)}
          >
            Save Quote
          </button>
          <button
            className={`${s.qbtn} ${s.qbtnI}`}
            onClick={handleShare}
          >
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
