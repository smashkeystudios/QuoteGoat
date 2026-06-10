import type { ComputedQuote, ContractType, PricingConfig, Tier, Feature } from "./types";

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const r5 = (n: number) => Math.ceil(n / 5) * 5;
export const cxM = (v: number) => 1 + (v - 1) * 0.15;
export const trfM = (v: number) => 1 + (v - 1) * 0.12;
export const clamp = (v: number, mn: number, mx: number) => Math.min(mx, Math.max(mn, v));

export const MOD_MIN = 5;
export const MOD_MAX = 200;

export function buildFeatMap(tiers: Tier[]): Record<string, number> {
  const m: Record<string, number> = {};
  tiers.forEach((t) => t.features.forEach((f) => { m[f.id] = t.id; }));
  return m;
}

export function buildAllFeats(tiers: Tier[]): Feature[] {
  return tiers.flatMap((t) => t.features);
}

export function computeQuote(params: {
  ct: ContractType;
  sel: Set<string>;
  cx: number;
  trf: number;
  config: PricingConfig;
  tiers: Tier[];
}): ComputedQuote {
  const { ct, sel, cx, trf, config, tiers } = params;
  const featMap = buildFeatMap(tiers);
  const cmx = cxM(cx);
  const tmx = trfM(trf);

  const baseUp = (fid: string): number =>
    (config[ct] as unknown as Record<string, number>)[`tier${featMap[fid]}`] ?? 0;
  const modPct = (fid: string): number => (config.mods[fid] ?? 30) / 100;
  const baseUpCx = (fid: string): number => r5(baseUp(fid) * cmx);
  const finalUp = (fid: string): number => r5(baseUp(fid) * (1 + modPct(fid)) * cmx);
  const moFeat = (fid: string): number =>
    ct !== "hosted" ? 0 : r5(((config.hosted as unknown as Record<string, number>)[`mo${featMap[fid]}`] ?? 0) * tmx);

  const arr = Array.from(sel);
  const bcRaw = r5(config[ct].base * cmx);
  const bcCommPct = (config.baseCommission || 0) / 100;
  const bc = r5(bcRaw * (1 + bcCommPct));
  const moBase = ct === "hosted" ? (config.hosted.moBase || 0) : 0;

  let upMod = 0, upBase = 0, moFeats = 0;
  arr.forEach((fid) => {
    upMod += finalUp(fid);
    upBase += baseUpCx(fid);
    moFeats += moFeat(fid);
  });
  const mo = r5(moBase + moFeats);

  return {
    bc,
    bcRaw,
    bcCommPct,
    upMod,
    upBase,
    mo,
    moBase: r5(moBase),
    moFeats,
    total: bc + upMod,
    totalNoMod: bcRaw + upBase,
    delta: (bc - bcRaw) + (upMod - upBase),
    arr,
    finalUp,
    moFeat,
    baseUp,
    baseUpCx,
    modPct,
  };
}
