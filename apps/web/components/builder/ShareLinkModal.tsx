"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import s from "@/styles/components/quickquotes.module.css";
import b from "@/styles/components/builder.module.css";

export function ShareLinkModal() {
  const setShowShareModal = useStore((st) => st.setShowShareModal);
  const shareQuoteId = useStore((st) => st.shareQuoteId);
  const [days, setDays] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const clamp = (v: number) => Math.min(14, Math.max(2, v));

  const handleGenerate = async () => {
    if (!shareQuoteId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: shareQuoteId, days }),
      });
      if (!res.ok) throw new Error("Share failed");
      const data = await res.json();
      setResult({ url: data.url, expiresAt: data.expiresAt });
    } catch {
      alert("Could not generate share link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const expiryLabel = result
    ? new Date(result.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className={s.qqModalBackdrop} onClick={() => setShowShareModal(false)}>
      <div className={s.qqModal} onClick={(e) => e.stopPropagation()}>
        <div className={s.qqModalTitle}>Share Proposal Link</div>
        <div className={s.qqModalSub}>
          Generate a client-facing HTML link. No commission or pricing details are included — clients see only final prices.
        </div>

        {!result ? (
          <>
            <div className={b.fld}>
              <label className={b.lbl}>Link Expiry (days)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className={`${b.qbtn} ${b.qbtnI}`}
                  style={{ padding: "8px 14px", flex: "none" }}
                  onClick={() => setDays((d) => clamp(d - 1))}
                  disabled={days <= 2}
                >−</button>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, minWidth: 36, textAlign: "center" }}>{days}</span>
                <button
                  className={`${b.qbtn} ${b.qbtnI}`}
                  style={{ padding: "8px 14px", flex: "none" }}
                  onClick={() => setDays((d) => clamp(d + 1))}
                  disabled={days >= 14}
                >+</button>
                <span style={{ fontSize: 11, color: "var(--mut)" }}>
                  {days === 1 ? "day" : "days"} · expires {new Date(Date.now() + days * 86_400_000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--mut)", marginTop: 6 }}>Min 2 days · Max 14 days</div>
            </div>

            <div className={s.qqModalBtns}>
              <button
                style={{ padding: "13px 20px", flex: "none" }}
                className={`${b.qbtn} ${b.qbtnP}`}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "Generating…" : "Generate Link"}
              </button>
              <button
                style={{ padding: "13px 20px", flex: "none" }}
                className={`${b.qbtn} ${b.qbtnI}`}
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 6 }}>
                Shareable Link
              </div>
              <div style={{
                background: "var(--p2)", border: "1px solid var(--line)", padding: "10px 12px",
                fontFamily: "var(--mono)", fontSize: 11, wordBreak: "break-all", lineHeight: 1.6,
                color: "var(--acc)"
              }}>
                {result.url}
              </div>
              <div style={{ fontSize: 10, color: "var(--mut)", marginTop: 6 }}>
                Expires {expiryLabel}
              </div>
            </div>
            <div className={s.qqModalBtns}>
              <button
                style={{ padding: "13px 20px", flex: "none" }}
                className={`${b.qbtn} ${b.qbtnP}`}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                style={{ padding: "13px 20px", flex: "none" }}
                className={`${b.qbtn} ${b.qbtnI}`}
                onClick={() => setShowShareModal(false)}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
