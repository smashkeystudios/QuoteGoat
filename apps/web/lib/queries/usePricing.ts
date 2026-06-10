"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useStore } from "../store";
import type { PricingConfig } from "../types";

const STALE = 10 * 60 * 1000;

export function usePricing() {
  const setPricingConfig = useStore((s) => s.setPricingConfig);
  return useQuery<PricingConfig>({
    queryKey: ["pricing"],
    queryFn: async () => {
      const res = await fetch("/api/pricing");
      if (!res.ok) throw new Error("Failed to fetch pricing");
      return res.json();
    },
    staleTime: STALE,
    select: (data) => {
      setPricingConfig(data);
      return data;
    },
  });
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
