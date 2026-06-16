import type { ContractType, QuoteInfo, Template, PricingConfig, SavedQuote } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";

export interface QuoteSlice {
  ct: ContractType;
  sel: Set<string>;
  cx: number;
  trf: number;
  royalty: number;
  info: QuoteInfo;
  notes: string[];

  setCt: (ct: ContractType) => void;
  toggleFeature: (id: string) => void;
  selectFeatures: (ids: string[]) => void;
  setCx: (v: number) => void;
  setTrf: (v: number) => void;
  setRoyalty: (v: number) => void;
  setInfo: (patch: Partial<QuoteInfo>) => void;
  addNote: () => void;
  updateNote: (idx: number, text: string) => void;
  deleteNote: (idx: number) => void;
  resetQuote: () => void;
  loadTemplate: (tpl: Template, pricingPatch?: Partial<PricingConfig>) => void;
  loadSavedQuote: (q: SavedQuote) => void;
}

const defaultInfo: QuoteInfo = {
  name: "",
  project: "",
  date: new Date().toISOString().slice(0, 10),
};

export const createQuoteSlice: StateCreator<StoreState, [], [], QuoteSlice> = (set) => ({
  ct: "handoff",
  sel: new Set<string>(),
  cx: 1,
  trf: 1,
  royalty: 5,
  info: defaultInfo,
  notes: [],

  setCt: (ct) => set({ ct }),
  toggleFeature: (id) =>
    set((s) => {
      const n = new Set(s.sel);
      n.has(id) ? n.delete(id) : n.add(id);
      return { sel: n };
    }),
  selectFeatures: (ids) => set({ sel: new Set(ids) }),
  setCx: (cx) => set({ cx }),
  setTrf: (trf) => set({ trf }),
  setRoyalty: (royalty) => set({ royalty: Math.min(30, Math.max(0, Math.round(royalty))) }),
  setInfo: (patch) => set((s) => ({ info: { ...s.info, ...patch } })),
  addNote: () => set((s) => ({ notes: [...s.notes, ""] })),
  updateNote: (idx, text) =>
    set((s) => { const n = [...s.notes]; n[idx] = text; return { notes: n }; }),
  deleteNote: (idx) =>
    set((s) => ({ notes: s.notes.filter((_, i) => i !== idx) })),
  resetQuote: () =>
    set({ ct: "handoff", sel: new Set(), cx: 1, trf: 1, royalty: 5, info: defaultInfo, notes: [] }),
  loadTemplate: (tpl) =>
    set({
      ct: tpl.ct,
      sel: new Set(tpl.features),
      cx: tpl.cx,
      trf: tpl.trf || 1,
    }),
  loadSavedQuote: (q) =>
    set({
      ct: q.ct,
      sel: new Set(q.sel),
      cx: q.cx,
      trf: q.trf,
      royalty: q.royalty ?? 5,
      info: q.info,
      notes: q.notes ?? [],
    }),
});
