import type { PricingConfig } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";
import { DEF_PRICING } from "../constants";
import { clamp, MOD_MIN, MOD_MAX } from "../calc";

export interface PricingSlice {
  pricingConfig: PricingConfig;
  pricingHydrated: boolean;

  setBasePrice: (contract: "handoff" | "hosted", key: string, val: number) => void;
  setMod: (featureId: string, pct: number) => void;
  setBaseCommission: (pct: number) => void;
  setCxRate: (rate: number) => void;
  setTrfRate: (rate: number) => void;
  setPricingConfig: (config: PricingConfig) => void;
}

export const createPricingSlice: StateCreator<StoreState, [], [], PricingSlice> = (set) => ({
  pricingConfig: DEF_PRICING,
  pricingHydrated: false,

  setBasePrice: (contract, key, val) =>
    set((s) => ({
      pricingConfig: {
        ...s.pricingConfig,
        [contract]: { ...s.pricingConfig[contract], [key]: Number(val) },
      },
    })),

  setMod: (featureId, raw) => {
    const v = clamp(Math.round(raw), MOD_MIN, MOD_MAX);
    set((s) => ({
      pricingConfig: {
        ...s.pricingConfig,
        mods: { ...s.pricingConfig.mods, [featureId]: v },
      },
    }));
  },

  setBaseCommission: (val) => {
    const v = clamp(Math.round(val), 0, MOD_MAX);
    set((s) => ({
      pricingConfig: { ...s.pricingConfig, baseCommission: v },
    }));
  },

  setCxRate: (val) => {
    const v = clamp(Math.round(val), 1, 100);
    set((s) => ({ pricingConfig: { ...s.pricingConfig, cxRate: v } }));
  },

  setTrfRate: (val) => {
    const v = clamp(Math.round(val), 1, 100);
    set((s) => ({ pricingConfig: { ...s.pricingConfig, trfRate: v } }));
  },

  setPricingConfig: (config) => set({ pricingConfig: config, pricingHydrated: true }),
});
