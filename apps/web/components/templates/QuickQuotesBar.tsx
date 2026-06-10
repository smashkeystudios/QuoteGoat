"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useDeleteTemplate } from "@/lib/queries/useTemplates";
import { PRESET_TEMPLATES } from "@/lib/constants";
import { SaveTemplateModal } from "./SaveTemplateModal";
import s from "@/styles/components/quickquotes.module.css";
import type { Template } from "@/lib/types";

export function QuickQuotesBar() {
  const showQQ = useStore((st) => st.showQQ);
  const setShowQQ = useStore((st) => st.setShowQQ);
  const showSaveModal = useStore((st) => st.showSaveModal);
  const setShowSaveModal = useStore((st) => st.setShowSaveModal);
  const customTemplates = useStore((st) => st.customTemplates);
  const loadTemplate = useStore((st) => st.loadTemplate);
  const { mutate: deleteTemplate } = useDeleteTemplate();
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

  const allGroups = [
    { label: "Preset Templates", items: PRESET_TEMPLATES, isCustom: false },
    ...(customTemplates.length > 0
      ? [{ label: "My Templates", items: customTemplates, isCustom: true }]
      : []),
  ];

  const total = PRESET_TEMPLATES.length + customTemplates.length;

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
        <span style={{ fontSize: 9, color: "var(--mut)", letterSpacing: "0.07em" }}>
          {total} template{total !== 1 ? "s" : ""}
        </span>
        <button className={s.qqSaveBtn} onClick={() => setShowSaveModal(true)}>
          + Save Current
        </button>

        {showQQ && (
          <div className={s.qqDropdown}>
            {allGroups.map((group) => (
              <div key={group.label}>
                <div className={s.qqSectionHead}>{group.label}</div>
                {group.items.map((tpl) => (
                  <div className={s.qqItem} key={tpl.id} onClick={() => handleLoad(tpl)}>
                    <div className={s.qqItemBody}>
                      <div className={s.qqItemName}>{tpl.name}</div>
                      <div className={s.qqItemDesc}>{tpl.desc}</div>
                      <div className={s.qqItemTags}>
                        <span className={`${s.qqItemTag} ${s.ct}`}>{tpl.ct}</span>
                        <span className={`${s.qqItemTag} ${s.cx}`}>cx {tpl.cx}</span>
                        {tpl.features.length > 0 && (
                          <span className={s.qqItemTag}>
                            {tpl.features.length} feature{tpl.features.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {tpl.baseCommission > 0 && (
                          <span className={s.qqItemTag}>+{tpl.baseCommission}% base comm.</span>
                        )}
                      </div>
                    </div>
                    {group.isCustom && (
                      <div className={s.qqItemRight} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={s.qqItemDel}
                          onClick={() => deleteTemplate(tpl.id)}
                          title="Delete template"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {showSaveModal && <SaveTemplateModal />}
    </>
  );
}
