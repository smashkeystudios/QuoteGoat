"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import s from "@/styles/components/quickquotes.module.css";
import b from "@/styles/components/builder.module.css";

type Mode = "client" | "internal";

export function ShareLinkModal() {
  const setShowShareModal = useStore((st) => st.setShowShareModal);
  const shareQuoteId = useStore((st) => st.shareQuoteId);
  const [mode, setMode] = useState<Mode>("client");
  const [days, setDays] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ url: string; expiresAt?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const clamp = (v: number) => Math.min(14, Math.max(2, v));

  const handleGenerate = async () => {
    if (!shareQuoteId) {
      alert("No quote is saved yet. Click 'Save Quote' first, then generate a share link.");
      return;
    }
    setGenerating(true);
    try {
      let res: Response;
      if (mode === "internal") {
        res = await fetch("/api/share/internal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: shareQuoteId }),
        });
      } else {
        res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId: shareQuoteId, days }),
        });
      }
      if (!res.ok) throw new Error("Share failed");
      const data = await res.json();
      setResult({ url: data.url, expiresAt: data.expiresAt });
      try {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch { /* clipboard may be blocked */ }
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

  const expiryLabel = result?.expiresAt
    ? new Date(result.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className={s.qqModalBackdrop} onClick={() => setShowShareModal(false)}>
      <div className={s.qqModal} onClick={(e) => e.stopPropagation()}>
        <div className={s.qqModalTitle}>Share Proposal Link</div>
        <div className={s.qqModalSub}>
          {mode === "client"
            ? "Client-facing link — no commission or pricing details, clients see only final prices."
            : "Internal link — full breakdown with commission, modifiers, LCV. Never expires. Do not share with client."}
        </div>

        {!result ? (
          <>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid var(--line2)" }}>
              <button
                onClick={() => setMode("client")}
                style={{
                  flex: 1, padding: "10px 14px", background: mode === "client" ? "var(--acc)" : "var(--p2)",
                  color: mode === "client" ? "var(--paper)" : "var(--mut)", border: "none", cursor: "pointer",
                  fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: "var(--mono)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                Client Link
              </button>
              <button
                onClick={() => setMode("internal")}
                style={{
                  flex: 1, padding: "10px 14px", background: mode === "internal" ? "#8b1a1a" : "var(--p2)",
                  color: mode === "internal" ? "#ffe0e0" : "var(--mut)", border: "none", cursor: "pointer",
                  fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: "var(--mono)",
                  transition: "background 0.15s, color 0.15s", borderLeft: "1px solid var(--line2)",
                }}
              >
                Internal Link
              </button>
            </div>

            {mode === "client" && (
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
            )}

            {mode === "internal" && (
              <div style={{ fontSize: 12, color: "#c84b2f", background: "rgba(139,26,26,0.15)", border: "1px solid #8b1a1a", padding: "10px 14px", marginBottom: 4 }}>
                ⚠ This link shows full commission breakdown, modifier percentages, and LCV projections. Keep internal only. Link never expires.
              </div>
            )}

            <div className={s.qqModalBtns}>
              <button
                style={{ padding: "13px 20px", flex: "none", background: mode === "internal" ? "#8b1a1a" : undefined }}
                className={`${b.qbtn} ${mode === "client" ? b.qbtnP : ""}`}
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
                {mode === "internal" ? "Internal Link" : "Shareable Link"}
                {copied && <span style={{ color: "var(--grn)", marginLeft: 6 }}>— Copied to clipboard!</span>}
              </div>
              <div
                onClick={handleCopy}
                title="Click to copy"
                style={{
                  background: mode === "internal" ? "rgba(139,26,26,0.15)" : "var(--p2)",
                  border: `1px solid ${mode === "internal" ? "#8b1a1a" : "var(--line)"}`,
                  padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 11,
                  wordBreak: "break-all", lineHeight: 1.6,
                  color: mode === "internal" ? "#c84b2f" : "var(--acc)", cursor: "pointer",
                }}
              >
                {result.url}
              </div>
              <div style={{ fontSize: 10, color: "var(--mut)", marginTop: 6 }}>
                {expiryLabel ? `Expires ${expiryLabel}` : "Permanent — never expires"} · Click link above or button below to copy
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
