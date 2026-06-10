"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useStore } from "../store";
import type { Tier, Feature } from "../types";

const STALE = 5 * 60 * 1000;

export function useFeatures() {
  const setTiers = useStore((s) => s.setTiers);
  return useQuery<Tier[]>({
    queryKey: ["features"],
    queryFn: async () => {
      const res = await fetch("/api/features");
      if (!res.ok) throw new Error("Failed to fetch features");
      return res.json();
    },
    staleTime: STALE,
    select: (data) => {
      setTiers(data);
      return data;
    },
  });
}

export function useAddFeature() {
  const addFeatureToTier = useStore((s) => s.addFeatureToTier);
  const setMod = useStore((s) => s.setMod);
  return useMutation({
    mutationFn: async (body: { name: string; tip: string; tierId: number }) => {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add feature");
      return res.json() as Promise<Feature>;
    },
    onMutate: async (newFeat) => {
      await queryClient.cancelQueries({ queryKey: ["features"] });
      const optimisticId = "opt-" + Date.now();
      const feature: Feature = { id: optimisticId, name: newFeat.name, tip: newFeat.tip, tierId: newFeat.tierId, sortOrder: 9999 };
      addFeatureToTier(newFeat.tierId, feature);
      setMod(optimisticId, 30);
      return { optimisticId };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["features"] }),
  });
}

export function useUpdateFeature() {
  const updateFeature = useStore((s) => s.updateFeature);
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Feature> & { id: string }) => {
      const res = await fetch(`/api/features/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update feature");
      return res.json();
    },
    onMutate: ({ id, ...patch }) => {
      updateFeature(id, patch);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["features"] }),
  });
}

export function useDeleteFeature() {
  const removeFeature = useStore((s) => s.removeFeature);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/features/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete feature");
    },
    onMutate: (id) => {
      removeFeature(id);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["features"] }),
  });
}
