"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useCreateTemplate } from "@/lib/queries/useTemplates";
import s from "@/styles/components/quickquotes.module.css";
import b from "@/styles/components/builder.module.css";

export function SaveTemplateModal() {
  const [name, setName] = useState("");
  const setShowSaveModal = useStore((st) => st.setShowSaveModal);
  const ct = useStore((st) => st.ct);
  const sel = useStore((st) => st.sel);
  const cx = useStore((st) => st.cx);
  const trf = useStore((st) => st.trf);
  const baseCommission = useStore((st) => st.pricingConfig.baseCommission);
  const { mutate: createTemplate } = useCreateTemplate();

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createTemplate({
      name: trimmed,
      desc: `${ct === "handoff" ? "Handoff" : "Hosted"} · ${sel.size} feature${sel.size !== 1 ? "s" : ""} · Complexity ${cx}`,
      ct, cx, trf,
      features: Array.from(sel),
      baseCommission,
    });
    setShowSaveModal(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setShowSaveModal(false);
  };

  return (
    <div className={s.qqModalBackdrop} onClick={() => setShowSaveModal(false)}>
      <div className={s.qqModal} onClick={(e) => e.stopPropagation()}>
        <div className={s.qqModalTitle}>Save as Template</div>
        <div className={s.qqModalSub}>
          {ct === "handoff" ? "Handoff" : "Hosted"} · {sel.size} feature{sel.size !== 1 ? "s" : ""} · Complexity {cx}
          <br />Name this configuration to reload it later from Quick Quotes.
        </div>
        <div className={b.fld}>
          <label className={b.lbl}>Template Name</label>
          <input
            className={b.inp}
            placeholder="e.g. E-commerce Standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>
        <div className={s.qqModalBtns}>
          <button
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnP}`}
            onClick={handleSave}
          >
            Save Template
          </button>
          <button
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnI}`}
            onClick={() => setShowSaveModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
