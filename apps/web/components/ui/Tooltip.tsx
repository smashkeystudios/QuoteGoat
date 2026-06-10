"use client";
import s from "@/styles/components/ui.module.css";

export function Tooltip({ text }: { text: string }) {
  return (
    <span className={s.tipWrap}>
      <span className={s.tipIcon}>?</span>
      <span className={s.tipBox}>{text}</span>
    </span>
  );
}
