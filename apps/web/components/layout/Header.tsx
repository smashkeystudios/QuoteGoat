"use client";
import Image from "next/image";
import { useStore } from "@/lib/store";
import s from "@/styles/components/header.module.css";

export function Header() {
  const info = useStore((st) => st.info);
  return (
    <header className={s.hdr}>
      <div className={s.hdrTop}>
        <div className={s.hdrBrand}>
          <Image src="/quotegoat-logo.png" alt="QuoteGoat" width={160} height={160} className={s.hdrLogo} priority />
          <div>
            <div className={s.hdrWord}>Powered by Jakomu Incorporated</div>
            <h1 className={s.hdrH1}>Quote<em>Goat</em></h1>
          </div>
        </div>
        {(info.name || info.project) && (
          <div className={s.hdrMeta}>
            {info.name && <>{info.name}<br /></>}
            {info.project && <>{info.project}<br /></>}
            {info.date}
          </div>
        )}
      </div>
    </header>
  );
}
