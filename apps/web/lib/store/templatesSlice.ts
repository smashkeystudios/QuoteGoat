import type { Template } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";

export interface TemplatesSlice {
  customTemplates: Template[];
  templatesHydrated: boolean;

  addTemplate: (tpl: Template) => void;
  removeTemplate: (id: string) => void;
  setCustomTemplates: (tpls: Template[]) => void;
}

export const createTemplatesSlice: StateCreator<StoreState, [], [], TemplatesSlice> = (set) => ({
  customTemplates: [],
  templatesHydrated: false,

  addTemplate: (tpl) => set((s) => ({ customTemplates: [...s.customTemplates, tpl] })),
  removeTemplate: (id) =>
    set((s) => ({ customTemplates: s.customTemplates.filter((t) => t.id !== id) })),
  setCustomTemplates: (tpls) => set({ customTemplates: tpls, templatesHydrated: true }),
});
