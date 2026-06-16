import type { StateCreator } from "zustand";
import type { StoreState } from "./index";

export type AppTab = "builder" | "pricing" | "features" | "quotes";

export interface UiSlice {
  tab: AppTab;
  stripExpanded: boolean;
  showQQ: boolean;
  showSaveModal: boolean;
  showSaveQuoteModal: boolean;
  pendingShare: boolean;        // true when Save modal was opened from Share button
  showShareModal: boolean;
  shareQuoteId: string | null;

  setTab: (tab: AppTab) => void;
  toggleStrip: () => void;
  setShowQQ: (v: boolean) => void;
  setShowSaveModal: (v: boolean) => void;
  setShowSaveQuoteModal: (v: boolean, pendingShare?: boolean) => void;
  setShowShareModal: (v: boolean, quoteId?: string) => void;
}

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
  tab: "builder",
  stripExpanded: false,
  showQQ: false,
  showSaveModal: false,
  showSaveQuoteModal: false,
  pendingShare: false,
  showShareModal: false,
  shareQuoteId: null,

  setTab: (tab) => set({ tab }),
  toggleStrip: () => set((s) => ({ stripExpanded: !s.stripExpanded })),
  setShowQQ: (showQQ) => set({ showQQ }),
  setShowSaveModal: (showSaveModal) => set({ showSaveModal }),
  setShowSaveQuoteModal: (showSaveQuoteModal, pendingShare = false) =>
    set({ showSaveQuoteModal, pendingShare }),
  setShowShareModal: (showShareModal, quoteId) =>
    set({ showShareModal, shareQuoteId: quoteId ?? null }),
});
