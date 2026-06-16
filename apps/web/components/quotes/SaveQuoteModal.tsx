"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useComputedQuote, useAllFeats } from "@/lib/store/selectors";
import s from "@/styles/components/quickquotes.module.css";
import b from "@/styles/components/builder.module.css";

const TIER_LABELS: Record<number, string> = { 1: "Tier I", 2: "Tier II", 3: "Tier III" };

export function SaveQuoteModal() {
  const setShowSaveQuoteModal = useStore((st) => st.setShowSaveQuoteModal);
  const setShowShareModal = useStore((st) => st.setShowShareModal);
  const pendingShare = useStore((st) => st.pendingShare);

  // Write directly to the store — no local state, no closure/stale issues
  const info = useStore((st) => st.info);
  const setInfo = useStore((st) => st.setInfo);

  const ct = useStore((st) => st.ct);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const Q = useComputedQuote();
  const allFeats = useAllFeats();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const clientName = info.name.trim();
    const projectName = info.project.trim();
    if (!clientName && !projectName) {
      setError("Enter at least a Client Name or Project Name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          info,
          ct, cx, trf,
          sel: Q.arr,
          features: Q.arr.map((fid) => {
            const f = allFeats.find((x) => x.id === fid);
            return {
              id: fid,
              name: f?.name ?? fid,
              tip: f?.tip ?? "",
              tier: f?.tierId ?? 1,
              tierLabel: TIER_LABELS[f?.tierId ?? 1] ?? "Tier I",
            };
          }),
          pricingSnapshot: pricingConfig,
          computed: { total: Q.total, mo: Q.mo, bc: Q.bc, delta: Q.delta },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setShowSaveQuoteModal(false);
      if (pendingShare) {
        setShowShareModal(true, saved.id);
      } else {
        setShowShareModal(false, saved.id);
      }
    } catch {
      setError("Could not save quote — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setShowSaveQuoteModal(false);
  };

  return (
    <div className={s.qqModalBackdrop} onClick={() => setShowSaveQuoteModal(false)}>
      <div className={s.qqModal} onClick={(e) => e.stopPropagation()}>
        <div className={s.qqModalTitle}>
          {pendingShare ? "Name Quote to Share" : "Save Quote"}
        </div>
        <div className={s.qqModalSub}>
          {pendingShare
            ? "Give this quote a name before generating the share link."
            : "Save to history — reload, download PDFs, or share any time."}
        </div>
        <div className={b.fld}>
          <label className={b.lbl}>Client Name</label>
          <input
            className={b.inp}
            placeholder="e.g. Acme Corp"
            value={info.name}
            onChange={(e) => setInfo({ name: e.target.value })}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>
        <div className={b.fld}>
          <label className={b.lbl}>Project Name</label>
          <input
            className={b.inp}
            placeholder="e.g. E-commerce Platform"
            value={info.project}
            onChange={(e) => setInfo({ project: e.target.value })}
            onKeyDown={handleKey}
          />
        </div>
        {error && (
          <div style={{ fontSize: 12, color: "var(--acc)", marginBottom: 12, letterSpacing: "0.02em" }}>
            {error}
          </div>
        )}
        <div className={s.qqModalBtns}>
          <button
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnP}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : pendingShare ? "Save & Share" : "Save Quote"}
          </button>
          <button
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnI}`}
            onClick={() => setShowSaveQuoteModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
