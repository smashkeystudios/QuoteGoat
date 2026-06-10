import type { ContractType, QuoteInfo, Template, PricingConfig, SavedQuote } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";

export interface QuoteSlice {
  ct: ContractType;
  sel: Set<string>;
  cx: number;
  trf: number;
  info: QuoteInfo;

  setCt: (ct: ContractType) => void;
  toggleFeature: (id: string) => void;
  selectFeatures: (ids: string[]) => void;
  setCx: (v: number) => void;
  setTrf: (v: number) => void;
  setInfo: (patch: Partial<QuoteInfo>) => void;
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
  info: defaultInfo,

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
  setInfo: (patch) => set((s) => ({ info: { ...s.info, ...patch } })),
  resetQuote: () =>
    set({ ct: "handoff", sel: new Set(), cx: 1, trf: 1, info: defaultInfo }),
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
      info: q.info,
    }),
});
