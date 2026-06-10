"use client";
import { useState, useEffect } from "react";
import s from "@/styles/components/builder.module.css";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function CurrencyInput({ value, onChange }: Props) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setRaw(String(value));
  }, [value, focused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    setTimeout(() => e.target.select(), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleBlur = () => {
    setFocused(false);
    const num = parseInt(raw, 10);
    const final = isNaN(num) || num < 0 ? 0 : num;
    setRaw(String(final));
    onChange(final);
  };

  return (
    <div className={s.currWrap}>
      <span className={s.currSym}>$</span>
      <input
        className={s.currInp}
        inputMode="numeric"
        value={focused ? raw : Number(value).toLocaleString("en-US")}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0"
      />
    </div>
  );
}
