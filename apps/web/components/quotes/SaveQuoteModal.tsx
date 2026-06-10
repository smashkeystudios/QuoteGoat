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
  const info = useStore((st) => st.info);
  const ct = useStore((st) => st.ct);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const pricingConfig = useStore((st) => st.pricingConfig);
  const Q = useComputedQuote();

  const [name, setName] = useState(info.name);
  const [project, setProject] = useState(info.project);
  const allFeats = useAllFeats();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          info: { ...info, name: name.trim() || info.name, project: project.trim() || info.project },
          ct, cx, trf,
          sel: Q.arr,
          features: Q.arr.map((fid) => {
            const f = allFeats.find((x) => x.id === fid);
            return { id: fid, name: f?.name ?? fid, tip: f?.tip ?? "", tier: f?.tierId ?? 1, tierLabel: TIER_LABELS[f?.tierId ?? 1] ?? "Tier I" };
          }),
          pricingSnapshot: pricingConfig,
          computed: { total: Q.total, mo: Q.mo, bc: Q.bc, delta: Q.delta },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setShowSaveQuoteModal(false);
      setShowShareModal(false, saved.id);
    } catch {
      alert("Could not save quote. Please try again.");
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
        <div className={s.qqModalTitle}>Save Quote</div>
        <div className={s.qqModalSub}>
          Save this quote to your history. You can reload it, download PDFs, or generate a share link any time.
        </div>
        <div className={b.fld}>
          <label className={b.lbl}>Client Name</label>
          <input
            className={b.inp}
            placeholder={info.name || "e.g. Acme Corp"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>
        <div className={b.fld}>
          <label className={b.lbl}>Project Name</label>
          <input
            className={b.inp}
            placeholder={info.project || "e.g. E-commerce Platform"}
            value={project}
            onChange={(e) => setProject(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>
        <div className={s.qqModalBtns}>
          <button
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnP}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Quote"}
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
