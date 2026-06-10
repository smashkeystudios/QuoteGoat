"use client";
import { useMemo } from "react";
import { useStore } from "./index";
import { computeQuote, buildFeatMap, buildAllFeats } from "../calc";
import type { ComputedQuote, Feature } from "../types";

export const useComputedQuote = (): ComputedQuote => {
  const ct = useStore((s) => s.ct);
  const sel = useStore((s) => s.sel);
  const cx = useStore((s) => s.cx);
  const trf = useStore((s) => s.trf);
  const config = useStore((s) => s.pricingConfig);
  const tiers = useStore((s) => s.tiers);

  return useMemo(
    () => computeQuote({ ct, sel, cx, trf, config, tiers }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ct, sel, cx, trf, config, tiers]
  );
};

export const useFeatMap = (): Record<string, number> => {
  const tiers = useStore((s) => s.tiers);
  return useMemo(() => buildFeatMap(tiers), [tiers]);
};

export const useAllFeats = (): Feature[] => {
  const tiers = useStore((s) => s.tiers);
  return useMemo(() => buildAllFeats(tiers), [tiers]);
};
