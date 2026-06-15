import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createQuoteSlice, type QuoteSlice } from "./quoteSlice";
import { createPricingSlice, type PricingSlice } from "./pricingSlice";
import { createFeaturesSlice, type FeaturesSlice } from "./featuresSlice";
import { createTemplatesSlice, type TemplatesSlice } from "./templatesSlice";
import { createUiSlice, type UiSlice } from "./uiSlice";

export type StoreState = QuoteSlice & PricingSlice & FeaturesSlice & TemplatesSlice & UiSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createQuoteSlice(...a),
      ...createPricingSlice(...a),
      ...createFeaturesSlice(...a),
      ...createTemplatesSlice(...a),
      ...createUiSlice(...a),
    }),
    {
      name: "quote-goat-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist the fields that should survive a page refresh
      partialize: (state) => ({
        ct: state.ct,
        cx: state.cx,
        trf: state.trf,
        info: state.info,
        sel: Array.from(state.sel),   // Set → Array for JSON
        pricingConfig: state.pricingConfig,
      }),
      // Restore sel back to a Set on hydration
      merge: (persisted, current) => {
        const p = persisted as Partial<StoreState> & { sel?: string[] };
        return {
          ...current,
          ...p,
          sel: new Set<string>(p.sel ?? []),
        };
      },
    }
  )
);
