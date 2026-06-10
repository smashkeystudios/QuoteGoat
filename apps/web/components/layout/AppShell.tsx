"use client";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { MobileShell } from "./MobileShell";
import { DesktopShell } from "./DesktopShell";

export function AppShell() {
  const { isMobile } = useBreakpoint();
  return isMobile ? <MobileShell /> : <DesktopShell />;
}
