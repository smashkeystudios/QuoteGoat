"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useStore } from "../store";
import type { Template } from "../types";

const STALE = 2 * 60 * 1000;

export function useTemplates() {
  const setCustomTemplates = useStore((s) => s.setCustomTemplates);
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
    staleTime: STALE,
    select: (data) => {
      const custom = data.filter((t) => !t.isPreset);
      setCustomTemplates(custom);
      return data;
    },
  });
}

export function useCreateTemplate() {
  const addTemplate = useStore((s) => s.addTemplate);
  return useMutation({
    mutationFn: async (body: Omit<Template, "id" | "isPreset">) => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json() as Promise<Template>;
    },
    onSuccess: (tpl) => {
      addTemplate(tpl);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const removeTemplate = useStore((s) => s.removeTemplate);
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
    },
    onMutate: (id) => removeTemplate(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
}
