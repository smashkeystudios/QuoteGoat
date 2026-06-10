import type { Tier, Feature } from "../types";
import type { StateCreator } from "zustand";
import type { StoreState } from "./index";
import { TIERS } from "../constants";

export interface FeaturesSlice {
  tiers: Tier[];
  featuresHydrated: boolean;

  setTiers: (tiers: Tier[]) => void;
  addFeatureToTier: (tierId: number, feature: Feature) => void;
  updateFeature: (id: string, patch: Partial<Feature>) => void;
  removeFeature: (id: string) => void;
}

export const createFeaturesSlice: StateCreator<StoreState, [], [], FeaturesSlice> = (set) => ({
  tiers: TIERS,
  featuresHydrated: false,

  setTiers: (tiers) => set({ tiers, featuresHydrated: true }),

  addFeatureToTier: (tierId, feature) =>
    set((s) => ({
      tiers: s.tiers.map((t) =>
        t.id === tierId ? { ...t, features: [...t.features, feature] } : t
      ),
    })),

  updateFeature: (id, patch) =>
    set((s) => ({
      tiers: s.tiers.map((t) => ({
        ...t,
        features: t.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      })),
    })),

  removeFeature: (id) =>
    set((s) => ({
      tiers: s.tiers.map((t) => ({
        ...t,
        features: t.features.filter((f) => f.id !== id),
      })),
      sel: new Set(Array.from(s.sel).filter((sid) => sid !== id)),
    })),
});
