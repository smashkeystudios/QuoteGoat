import type { PricingConfig } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";
import { DEF_PRICING } from "../constants";
import { clamp, MOD_MIN, MOD_MAX } from "../calc";

export interface PricingSlice {
  /** Active working config — base pricing is always live; mods/baseCommission may be
   * temporarily overlaid by a loaded saved quote (see quoteSlice's loadedQuoteId). */
  pricingConfig: PricingConfig;
  /** Current default modifiers — what a brand-new quote starts from. Mirrors the
   * server's mods/baseCommission, independent of whatever a loaded quote overlays. */
  defaultMods: Record<string, number>;
  defaultBaseCommission: number;

  setBasePrice: (contract: "handoff" | "hosted", key: string, val: number) => void;
  setMod: (featureId: string, pct: number) => void;
  setBaseCommission: (pct: number) => void;
  setCxRate: (rate: number) => void;
  setTrfRate: (rate: number) => void;
  setPricingConfig: (config: PricingConfig) => void;
}

export const createPricingSlice: StateCreator<StoreState, [], [], PricingSlice> = (set, get) => ({
  pricingConfig: DEF_PRICING,
  defaultMods: { ...DEF_PRICING.mods },
  defaultBaseCommission: DEF_PRICING.baseCommission,

  setBasePrice: (contract, key, val) =>
    set((s) => ({
      pricingConfig: {
        ...s.pricingConfig,
        [contract]: { ...s.pricingConfig[contract], [key]: Number(val) },
      },
    })),

  setMod: (featureId, raw) => {
    const v = clamp(Math.round(raw), MOD_MIN, MOD_MAX);
    set((s) => {
      const mods = { ...s.pricingConfig.mods, [featureId]: v };
      const isEditingLoadedQuote = get().loadedQuoteId !== null;
      return {
        pricingConfig: { ...s.pricingConfig, mods },
        ...(isEditingLoadedQuote ? {} : { defaultMods: mods }),
      };
    });
  },

  setBaseCommission: (val) => {
    const v = clamp(Math.round(val), 0, MOD_MAX);
    set((s) => {
      const isEditingLoadedQuote = get().loadedQuoteId !== null;
      return {
        pricingConfig: { ...s.pricingConfig, baseCommission: v },
        ...(isEditingLoadedQuote ? {} : { defaultBaseCommission: v }),
      };
    });
  },

  setCxRate: (val) => {
    const v = clamp(Math.round(val), 1, 100);
    set((s) => ({ pricingConfig: { ...s.pricingConfig, cxRate: v } }));
  },

  setTrfRate: (val) => {
    const v = clamp(Math.round(val), 1, 100);
    set((s) => ({ pricingConfig: { ...s.pricingConfig, trfRate: v } }));
  },

  setPricingConfig: (config) =>
    set((s) => {
      const isEditingLoadedQuote = get().loadedQuoteId !== null;
      return {
        pricingConfig: {
          ...config,
          ...(isEditingLoadedQuote
            ? { mods: s.pricingConfig.mods, baseCommission: s.pricingConfig.baseCommission }
            : {}),
        },
        defaultMods: { ...config.mods },
        defaultBaseCommission: config.baseCommission,
      };
    }),
});
