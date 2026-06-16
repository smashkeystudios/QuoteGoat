"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useFeatures } from "@/lib/queries/useFeatures";
import { useCreateTemplate, useUpdateTemplate } from "@/lib/queries/useTemplates";
import s from "@/styles/components/quickquotes.module.css";
import b from "@/styles/components/builder.module.css";
import type { Template, ContractType } from "@/lib/types";

interface Props {
  /** null = create from scratch, "builder" = create pre-filled from builder state, Template = edit */
  mode: Template | "builder" | "scratch";
  onClose: () => void;
}

function Stepper({ label, value, min = 1, max = 5, onChange }: {
  label: string; value: number; min?: number; max?: number; onChange: (v: number) => void;
}) {
  return (
    <div className={b.fld}>
      <label className={b.lbl}>{label} <span style={{ color: "var(--acc)" }}>{value}</span></label>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              flex: 1, padding: "10px 0", border: "1px solid var(--line)", background: value === v ? "var(--ink)" : "var(--p2)",
              color: value === v ? "var(--paper)" : "var(--mut)", fontFamily: "var(--mono)", fontSize: 12,
              cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.1s",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TemplateEditModal({ mode, onClose }: Props) {
  const { data: tiers = [] } = useFeatures();
  const { mutate: create, isPending: creating } = useCreateTemplate();
  const { mutate: update, isPending: updating } = useUpdateTemplate();

  const builderCt = useStore((s) => s.ct);
  const builderCx = useStore((s) => s.cx);
  const builderTrf = useStore((s) => s.trf);
  const builderSel = useStore((s) => s.sel);
  const builderRoyalty = useStore((s) => s.royalty);
  const pricingConfig = useStore((s) => s.pricingConfig);

  const isEdit = mode !== "scratch" && mode !== "builder";
  const fromBuilder = mode === "builder";

  const initialCt: ContractType = isEdit ? (mode as Template).ct : fromBuilder ? builderCt : "handoff";
  const initialCx = isEdit ? (mode as Template).cx : fromBuilder ? builderCx : 1;
  const initialTrf = isEdit ? (mode as Template).trf : fromBuilder ? builderTrf : 1;
  const initialFeatures: Set<string> = isEdit
    ? new Set((mode as Template).features)
    : fromBuilder
    ? new Set(builderSel)
    : new Set();
  const initialComm = isEdit
    ? (mode as Template).baseCommission
    : fromBuilder
    ? pricingConfig.baseCommission
    : 0;
  const initialRoyalty = isEdit
    ? ((mode as Template).royalty ?? 0)
    : fromBuilder
    ? builderRoyalty
    : 0;

  const [name, setName] = useState(isEdit ? (mode as Template).name : "");
  const [desc, setDesc] = useState(isEdit ? (mode as Template).desc : "");
  const [ct, setCt] = useState<ContractType>(initialCt);
  const [cx, setCx] = useState(initialCx);
  const [trf, setTrf] = useState(initialTrf);
  const [commission, setCommission] = useState(initialComm);
  const [royalty, setRoyalty] = useState(initialRoyalty);
  const [selected, setSelected] = useState<Set<string>>(initialFeatures);
  const [error, setError] = useState("");

  // Reset trf to 1 when switching to handoff
  useEffect(() => {
    if (ct === "handoff") setTrf(1);
  }, [ct]);

  const toggleFeature = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) { setError("Template name is required."); return; }
    setError("");

    const autoDesc = desc.trim() ||
      `${ct === "handoff" ? "Handoff" : "Hosted"} · ${selected.size} feature${selected.size !== 1 ? "s" : ""} · Complexity ${cx}`;

    const payload = {
      name: name.trim(),
      desc: autoDesc,
      ct,
      cx,
      trf,
      features: Array.from(selected),
      baseCommission: commission,
      royalty,
      custom: true,
    };

    if (isEdit) {
      update({ id: (mode as Template).id, ...payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const isPending = creating || updating;

  return (
    <div className={s.qqModalBackdrop} onClick={onClose}>
      <div
        className={s.qqModal}
        style={{ maxWidth: 560, maxHeight: "85dvh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.qqModalTitle}>
          {isEdit ? "Edit Template" : fromBuilder ? "Save as Template" : "New Template"}
        </div>
        <div className={s.qqModalSub}>
          {isEdit
            ? "Update this quick quote template."
            : fromBuilder
            ? "Save current builder state as a reusable template."
            : "Build a template from scratch."}
        </div>

        <div className={b.fld}>
          <label className={b.lbl}>Template Name *</label>
          <input
            className={b.inp}
            placeholder="e.g. Starter SaaS"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>

        <div className={b.fld}>
          <label className={b.lbl}>Description <span style={{ color: "var(--mut)", fontWeight: 400 }}>(auto-generated if blank)</span></label>
          <input
            className={b.inp}
            placeholder="Brief summary of this template…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Contract Type */}
        <div className={b.fld}>
          <label className={b.lbl}>Contract Type</label>
          <div style={{ display: "flex", gap: 0 }}>
            {(["handoff", "hosted"] as ContractType[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCt(v)}
                style={{
                  flex: 1, padding: "11px 0", border: "1px solid var(--line)", background: ct === v ? "var(--ink)" : "var(--p2)",
                  color: ct === v ? "var(--paper)" : "var(--mut)", fontFamily: "var(--mono)", fontSize: 12,
                  cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.1s",
                  marginRight: v === "handoff" ? -1 : 0,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className={b.fldRow}>
          <Stepper label="Complexity" value={cx} onChange={setCx} />
          {ct === "hosted" && <Stepper label="Traffic" value={trf} onChange={setTrf} />}
        </div>

        <div className={b.fldRow}>
          <div className={b.fld}>
            <label className={b.lbl}>Base Commission %</label>
            <input
              className={b.inp}
              type="number"
              min={0}
              max={50}
              value={commission}
              onChange={(e) => setCommission(Math.min(50, Math.max(0, Number(e.target.value))))}
            />
          </div>
          {ct === "hosted" && (
            <div className={b.fld}>
              <label className={b.lbl}>Monthly Royalty %</label>
              <input
                className={b.inp}
                type="number"
                min={0}
                max={30}
                value={royalty}
                onChange={(e) => setRoyalty(Math.min(30, Math.max(0, Number(e.target.value))))}
              />
            </div>
          )}
        </div>

        {/* Feature checklist */}
        <div className={b.fld}>
          <label className={b.lbl}>
            Features <span style={{ color: "var(--mut)" }}>({selected.size} selected)</span>
          </label>
          <div style={{ border: "1px solid var(--line)", maxHeight: 220, overflowY: "auto" }}>
            {tiers.map((tier) => (
              <div key={tier.id}>
                <div style={{
                  padding: "8px 12px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--mut)", background: "var(--p2)", borderBottom: "1px solid var(--line)",
                }}>
                  {tier.label}
                </div>
                {tier.features.map((feat) => (
                  <label
                    key={feat.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                      borderBottom: "1px solid var(--line)", cursor: "pointer",
                      background: selected.has(feat.id) ? "rgba(200,75,47,0.04)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(feat.id)}
                      onChange={() => toggleFeature(feat.id)}
                      style={{ accentColor: "var(--acc)", width: 14, height: 14, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: "var(--ink)" }}>{feat.name}</span>
                    {feat.tip && (
                      <span style={{ fontSize: 11, color: "var(--mut)", marginLeft: "auto", textAlign: "right", lineHeight: 1.4 }}>
                        {feat.tip}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ))}
            {tiers.length === 0 && (
              <div style={{ padding: "16px 12px", fontSize: 12, color: "var(--mut)", fontStyle: "italic" }}>
                Loading features…
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "var(--acc)", marginBottom: 12, letterSpacing: "0.02em" }}>
            {error}
          </div>
        )}

        <div className={s.qqModalBtns}>
          <button
            type="button"
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnP}`}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
          </button>
          <button
            type="button"
            style={{ padding: "13px 20px", flex: "none" }}
            className={`${b.qbtn} ${b.qbtnI}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
