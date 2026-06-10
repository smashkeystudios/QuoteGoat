"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useFeatures } from "@/lib/queries/useFeatures";
import { usePricing } from "@/lib/queries/usePricing";
import { useTemplates } from "@/lib/queries/useTemplates";

export default function BuilderApp() {
  useFeatures();
  usePricing();
  useTemplates();

  return <AppShell />;
}
