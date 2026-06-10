import { create } from "zustand";
import { createQuoteSlice, type QuoteSlice } from "./quoteSlice";
import { createPricingSlice, type PricingSlice } from "./pricingSlice";
import { createFeaturesSlice, type FeaturesSlice } from "./featuresSlice";
import { createTemplatesSlice, type TemplatesSlice } from "./templatesSlice";
import { createUiSlice, type UiSlice } from "./uiSlice";

export type StoreState = QuoteSlice & PricingSlice & FeaturesSlice & TemplatesSlice & UiSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createQuoteSlice(...a),
  ...createPricingSlice(...a),
  ...createFeaturesSlice(...a),
  ...createTemplatesSlice(...a),
  ...createUiSlice(...a),
}));
