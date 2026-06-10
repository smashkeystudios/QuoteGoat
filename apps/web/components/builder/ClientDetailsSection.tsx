"use client";
import { useStore } from "@/lib/store";
import s from "@/styles/components/builder.module.css";

export function ClientDetailsSection() {
  const info = useStore((st) => st.info);
  const setInfo = useStore((st) => st.setInfo);

  return (
    <>
      <div className={s.sh}>
        <span className={s.shNum}>01</span>
        <span className={s.shTitle}>Client Details</span>
        <span className={s.shTag}>Info</span>
      </div>
      <div className={s.blk}>
        <div className={s.blkIn}>
          <div className={s.fldRow}>
            <div className={s.fld}>
              <label className={s.lbl}>Client Name</label>
              <input
                className={s.inp}
                placeholder="Acme Corp."
                value={info.name}
                onChange={(e) => setInfo({ name: e.target.value })}
              />
            </div>
            <div className={s.fld}>
              <label className={s.lbl}>Project Name</label>
              <input
                className={s.inp}
                placeholder="Platform Rebuild"
                value={info.project}
                onChange={(e) => setInfo({ project: e.target.value })}
              />
            </div>
          </div>
          <div className={s.fld}>
            <label className={s.lbl}>Date</label>
            <input
              className={s.inp}
              type="date"
              value={info.date}
              onChange={(e) => setInfo({ date: e.target.value })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
