import { getKV, setKV } from "./kv";
import { DEF_PRICING } from "./constants";
import type { PricingConfig } from "./types";

export const PRICING_KEY = "pricing:config";

/** Current, server-persisted base pricing — the single source of truth used
 * everywhere pricing needs to be live (new quotes, saved quotes, share links, PDFs). */
export async function getLivePricingConfig(): Promise<PricingConfig> {
  let config = await getKV<PricingConfig>(PRICING_KEY);
  if (!config) {
    config = DEF_PRICING as PricingConfig;
    await setKV(PRICING_KEY, config);
  }
  return config;
}

/** Combine live base pricing with a saved quote's own frozen commission modifiers. */
export function withQuoteModifiers(
  live: PricingConfig,
  mods: Record<string, number>,
  baseCommission: number
): PricingConfig {
  return { ...live, mods, baseCommission };
}
