"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SavedQuote } from "@/lib/types";

const STALE = 30 * 1000;

export function useQuotes() {
  return useQuery<SavedQuote[]>({
    queryKey: ["quotes"],
    queryFn: async () => {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return res.json();
    },
    staleTime: STALE,
  });
}

export function useSaveQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: object) => {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save quote");
      return res.json() as Promise<SavedQuote>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete quote");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}
