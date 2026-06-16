"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useTemplates, useDeleteTemplate } from "@/lib/queries/useTemplates";
import { TemplateEditModal } from "./TemplateEditModal";
import s from "@/styles/components/quickquotes.module.css";
import type { Template } from "@/lib/types";

type ModalMode = Template | "builder" | "scratch" | null;

export function QuickQuotesBar() {
  const showQQ = useStore((st) => st.showQQ);
  const setShowQQ = useStore((st) => st.setShowQQ);
  const loadTemplate = useStore((st) => st.loadTemplate);
  const { data: allTemplates = [] } = useTemplates();
  const { mutate: deleteTemplate } = useDeleteTemplate();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showQQ && barRef.current && !barRef.current.contains(e.target as Node)) {
        setShowQQ(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showQQ, setShowQQ]);

  const handleLoad = (tpl: Template) => {
    loadTemplate(tpl);
    setShowQQ(false);
  };

  const handleEdit = (e: React.MouseEvent, tpl: Template) => {
    e.stopPropagation();
    setShowQQ(false);
    setModalMode(tpl);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTemplate(id);
  };

  return (
    <>
      <div ref={barRef} className={s.qqBar}>
        <button
          className={`${s.qqTrigger} ${showQQ ? s.open : ""}`}
          onClick={() => setShowQQ(!showQQ)}
        >
          <span>Quick Quotes</span>
          <span className={s.qqTriggerArr}>▼</span>
        </button>
        <span className={s.qqSep} />
        <span style={{ fontSize: 11, color: "var(--mut)", letterSpacing: "0.07em" }}>
          {allTemplates.length} template{allTemplates.length !== 1 ? "s" : ""}
        </span>
        <button
          className={s.qqSaveBtn}
          style={{ marginLeft: 16 }}
          onClick={() => { setShowQQ(false); setModalMode("scratch"); }}
        >
          + New
        </button>
        <button
          className={s.qqSaveBtn}
          onClick={() => { setShowQQ(false); setModalMode("builder"); }}
        >
          Save Current
        </button>

        {showQQ && (
          <div className={s.qqDropdown}>
            {allTemplates.length === 0 && (
              <div style={{ padding: "20px", fontSize: 13, color: "#5a5550", fontStyle: "italic", textAlign: "center" }}>
                No templates yet — create one above.
              </div>
            )}
            {allTemplates.map((tpl) => (
              <div className={s.qqItem} key={tpl.id} onClick={() => handleLoad(tpl)}>
                <div className={s.qqItemBody}>
                  <div className={s.qqItemName}>{tpl.name}</div>
                  {tpl.desc && <div className={s.qqItemDesc}>{tpl.desc}</div>}
                  <div className={s.qqItemTags}>
                    <span className={`${s.qqItemTag} ${s.ct}`}>{tpl.ct}</span>
                    <span className={`${s.qqItemTag} ${s.cx}`}>cx {tpl.cx}</span>
                    {tpl.features.length > 0 && (
                      <span className={s.qqItemTag}>
                        {tpl.features.length} feat.
                      </span>
                    )}
                    {tpl.baseCommission > 0 && (
                      <span className={s.qqItemTag}>+{tpl.baseCommission}% comm.</span>
                    )}
                    {tpl.ct === "hosted" && (tpl.royalty ?? 0) > 0 && (
                      <span className={s.qqItemTag}>{tpl.royalty}% royalty</span>
                    )}
                  </div>
                </div>
                <div className={s.qqItemRight} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={s.qqItemDel}
                    style={{ color: "#6a6060", fontSize: 12, padding: "3px 7px" }}
                    onClick={(e) => handleEdit(e, tpl)}
                    title="Edit template"
                  >
                    ✎
                  </button>
                  <button
                    className={s.qqItemDel}
                    onClick={(e) => handleDelete(e, tpl.id)}
                    title="Delete template"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalMode !== null && (
        <TemplateEditModal mode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </>
  );
}
