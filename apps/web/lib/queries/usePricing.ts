"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useStore } from "../store";
import type { PricingConfig } from "../types";

const STALE = 10 * 60 * 1000;

export function usePricing() {
  const setPricingConfig = useStore((s) => s.setPricingConfig);

  // Wait for zustand persist to finish reading from localStorage before
  // deciding whether to seed from KV. Without this, the KV response can
  // arrive and overwrite LS data before LS has even been read.
  const [storeReady, setStoreReady] = useState(() => useStore.persist.hasHydrated());
  useEffect(() => {
    if (!storeReady) {
      return useStore.persist.onFinishHydration(() => setStoreReady(true));
    }
  }, [storeReady]);

  const query = useQuery<PricingConfig>({
    queryKey: ["pricing"],
    queryFn: async () => {
      const res = await fetch("/api/pricing");
      if (!res.ok) throw new Error("Failed to fetch pricing");
      return res.json();
    },
    staleTime: STALE,
    // Don't run until we know whether LS had data
    enabled: storeReady,
  });

  // Sync the store whenever a fresh server value actually arrives (not on every
  // render — `data` only changes reference on a genuine new fetch result), so
  // Pricing-tab edits made elsewhere always propagate here, not just on first load.
  useEffect(() => {
    if (query.data) setPricingConfig(query.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}

export function useUpdatePricing() {
  return useMutation({
    mutationFn: async (patch: Partial<PricingConfig>) => {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update pricing");
      return res.json() as Promise<PricingConfig>;
    },
    onSuccess: (data) => {
      useStore.getState().setPricingConfig(data);
      queryClient.setQueryData(["pricing"], data);
    },
  });
}
