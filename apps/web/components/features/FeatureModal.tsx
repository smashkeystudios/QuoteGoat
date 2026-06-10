"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Tier, Feature } from "@/lib/types";
import s from "@/styles/components/features.module.css";
import b from "@/styles/components/builder.module.css";

interface Props {
  title: string;
  initial: { name: string; tip: string; tierId: number };
  tiers: Tier[];
  onSave: (data: { name: string; tip: string; tierId: number }) => void;
  onClose: () => void;
  isEdit?: boolean;
}

export function FeatureModal({ title, initial, tiers, onSave, onClose, isEdit = false }: Props) {
  const [name, setName] = useState(initial.name);
  const [tip, setTip] = useState(initial.tip);
  const [tierId, setTierId] = useState(initial.tierId);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    autoResize(taRef.current);
  }, [tip, autoResize]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), tip: tip.trim(), tierId });
  };

  return (
    <div className={s.ftModalBackdrop} onClick={onClose}>
      <div className={s.ftModal} onClick={(e) => e.stopPropagation()}>
        <div className={s.ftModalHd}>
          <span className={s.ftModalTitle}>{title}</span>
          <button className={s.ftModalClose} onClick={onClose}>×</button>
        </div>
        <div className={s.ftModalBody}>
          <div className={b.fld}>
            <label className={b.lbl}>Feature Name *</label>
            <input
              className={b.inp}
              placeholder="e.g. Payment Gateway Integration"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave()}
              autoFocus
            />
          </div>
          <div className={b.fld}>
            <label className={b.lbl}>Description / Tooltip</label>
            <textarea
              ref={taRef}
              className={s.ftTextarea}
              placeholder="Brief description shown on hover…"
              value={tip}
              rows={2}
              onChange={(e) => { setTip(e.target.value); autoResize(e.target); }}
              onFocus={(e) => autoResize(e.target)}
            />
          </div>
          {!isEdit && (
            <div className={b.fld}>
              <label className={b.lbl}>Assign to Tier</label>
              <div className={s.tierRadioGroup}>
                {tiers.map((t) => (
                  <label key={t.id} style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="radio"
                      name="feat-tier"
                      className={s.tierRadio}
                      value={t.id}
                      checked={tierId === t.id}
                      onChange={() => setTierId(t.id)}
                      id={`tier-radio-${t.id}`}
                    />
                    <label htmlFor={`tier-radio-${t.id}`} className={s.tierRadioLbl}>
                      {t.label}
                    </label>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "var(--mut)", marginTop: 8, letterSpacing: "0.05em" }}>
                Pricing is inherited from the tier&apos;s base rate in Pricing Settings.
              </div>
            </div>
          )}
          <div className={s.ftModalBtns}>
            <button
              className={`${b.qbtn} ${b.qbtnP}`}
              style={{ padding: "13px 20px", flex: "none" }}
              onClick={handleSave}
            >
              {isEdit ? "Save Changes" : "Add Feature"}
            </button>
            <button
              className={`${b.qbtn} ${b.qbtnI}`}
              style={{ padding: "13px 20px", flex: "none" }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
