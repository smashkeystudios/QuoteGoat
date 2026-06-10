"use client";
import { useStore } from "@/lib/store";
import type { AppTab } from "@/lib/store/uiSlice";
import s from "@/styles/mobile.module.css";

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: "builder",  label: "Builder",  icon: "◈" },
  { id: "pricing",  label: "Pricing",  icon: "◉" },
  { id: "features", label: "Features", icon: "◫" },
  { id: "quotes",   label: "Quotes",   icon: "⊡" },
];

export function MobileNav() {
  const tab = useStore((st) => st.tab);
  const setTab = useStore((st) => st.setTab);

  return (
    <nav className={s.mobileNav}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`${s.mobileNavBtn} ${tab === t.id ? s.active : ""}`}
          onClick={() => setTab(t.id)}
        >
          <span className={s.mobileNavIcon}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
