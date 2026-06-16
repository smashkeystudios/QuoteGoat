"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import s from "@/styles/components/builder.module.css";

export function NotesSection() {
  const notes = useStore((st) => st.notes);
  const addNote = useStore((st) => st.addNote);
  const updateNote = useStore((st) => st.updateNote);
  const deleteNote = useStore((st) => st.deleteNote);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAdd = () => {
    addNote();
    // Focus the new input on next tick
    setTimeout(() => {
      inputRefs.current[notes.length]?.focus();
    }, 0);
  };

  const handleKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Backspace" && notes[idx] === "") {
      e.preventDefault();
      deleteNote(idx);
      setTimeout(() => inputRefs.current[Math.max(0, idx - 1)]?.focus(), 0);
    }
  };

  return (
    <>
      <div className={s.sh} style={{ marginTop: 8 }}>
        <span className={s.shNum}>04</span>
        <span className={s.shTitle}>Notes</span>
        <span className={s.shTag}>{notes.length} item{notes.length !== 1 ? "s" : ""}</span>
      </div>
      <div className={s.blk}>
        <div className={s.blkIn} style={{ paddingBottom: notes.length === 0 ? 18 : 10 }}>
          {notes.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--mut)", fontStyle: "italic", marginBottom: 14, letterSpacing: "0.03em" }}>
              No notes yet — add a bullet below.
            </div>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notes.map((text, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "var(--acc)", fontSize: 16, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>•</span>
                <input
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  className={s.inp}
                  style={{ flex: 1, padding: "9px 12px", fontSize: 14 }}
                  value={text}
                  placeholder="Add a note…"
                  onChange={(e) => updateNote(idx, e.target.value)}
                  onKeyDown={(e) => handleKey(e, idx)}
                />
                <button
                  onClick={() => deleteNote(idx)}
                  style={{
                    flexShrink: 0, width: 26, height: 26, border: "1.5px solid var(--line2)",
                    background: "var(--p2)", cursor: "pointer", color: "var(--mut)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, lineHeight: 1, transition: "background 0.1s, color 0.1s",
                  }}
                  title="Delete note"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleAdd}
            style={{
              marginTop: notes.length > 0 ? 6 : 0,
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--mut)", padding: "4px 0", fontFamily: "var(--mono)",
              transition: "color 0.15s",
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Note
          </button>
        </div>
      </div>
    </>
  );
}
