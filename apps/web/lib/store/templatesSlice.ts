import type { Template } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";

export interface TemplatesSlice {
  templates: Template[];
  /** @deprecated use templates */
  customTemplates: Template[];

  addTemplate: (tpl: Template) => void;
  updateTemplate: (tpl: Template) => void;
  removeTemplate: (id: string) => void;
  setTemplates: (tpls: Template[]) => void;
  /** @deprecated use setTemplates */
  setCustomTemplates: (tpls: Template[]) => void;
}

export const createTemplatesSlice: StateCreator<StoreState, [], [], TemplatesSlice> = (set) => ({
  templates: [],
  customTemplates: [],

  addTemplate: (tpl) =>
    set((s) => ({ templates: [...s.templates, tpl], customTemplates: [...s.templates, tpl] })),
  updateTemplate: (tpl) =>
    set((s) => {
      const next = s.templates.map((t) => (t.id === tpl.id ? tpl : t));
      return { templates: next, customTemplates: next };
    }),
  removeTemplate: (id) =>
    set((s) => {
      const next = s.templates.filter((t) => t.id !== id);
      return { templates: next, customTemplates: next };
    }),
  setTemplates: (tpls) => set({ templates: tpls, customTemplates: tpls }),
  setCustomTemplates: (tpls) => set({ templates: tpls, customTemplates: tpls }),
});
