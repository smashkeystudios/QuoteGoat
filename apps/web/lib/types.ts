export type ContractType = "handoff" | "hosted";

export interface Feature {
  id: string;
  name: string;
  tip: string;
  tierId: number;
  sortOrder: number;
}

export interface Tier {
  id: number;
  label: string;
  cls: string;
  tooltip: string;
  features: Feature[];
}

export interface PricingHandoff {
  base: number;
  tier1: number;
  tier2: number;
  tier3: number;
}

export interface PricingHosted extends PricingHandoff {
  moBase: number;
  mo1: number;
  mo2: number;
  mo3: number;
}

export interface PricingConfig {
  id: 1;
  handoff: PricingHandoff;
  hosted: PricingHosted;
  mods: Record<string, number>;
  baseCommission: number;
  cxRate?: number;  // percent per complexity step, default 15
  trfRate?: number; // percent per traffic step, default 20
}

export interface Template {
  id: string;
  name: string;
  desc: string;
  ct: ContractType;
  cx: number;
  trf: number;
  features: string[];
  baseCommission: number;
  isPreset: boolean;
  custom?: boolean;
}

export interface QuoteInfo {
  name: string;
  project: string;
  date: string;
}

export interface ComputedQuote {
  bc: number;
  bcRaw: number;
  bcCommPct: number;
  upMod: number;
  upBase: number;
  mo: number;          // monthly before royalty
  moBase: number;
  moFeats: number;
  moFinal: number;     // monthly after royalty (= mo when handoff or royalty=0)
  royaltyAmt: number;  // dollar amount added by royalty
  total: number;
  totalNoMod: number;
  delta: number;
  arr: string[];
  finalUp: (fid: string) => number;
  moFeat: (fid: string) => number;
  baseUp: (fid: string) => number;
  baseUpCx: (fid: string) => number;
  modPct: (fid: string) => number;
}

export interface PdfFeatureRow {
  id: string;
  name: string;
  tier: number;
  tierLabel: string;
  tip: string;
  basePrice: number;
  commission: number;
  finalPrice: number;
  monthlyPrice?: number;
}

export interface PdfPayload {
  quoteInfo: QuoteInfo;
  contractType: ContractType;
  complexity: number;
  traffic: number;
  computed: {
    bc: number;
    bcRaw: number;
    bcCommPct: number;
    upMod: number;
    upBase: number;
    mo: number;
    moBase: number;
    moFeats: number;
    total: number;
    totalNoMod: number;
    delta: number;
  };
  featureRows: PdfFeatureRow[];
  quoteId?: string;
  validityDays?: number;
}

export interface SavedQuoteFeature {
  id: string;
  name: string;
  tip: string;
  tier: number;
  tierLabel: string;
}

export interface SavedQuote {
  id: string;
  savedAt: string;
  info: QuoteInfo;
  ct: ContractType;
  cx: number;
  trf: number;
  royalty?: number;
  sel: string[];
  features: SavedQuoteFeature[];
  notes?: string[];
  pricingSnapshot: PricingConfig;
  computed: {
    total: number;
    mo: number;
    moFinal: number;
    bc: number;
    delta: number;
  };
  clientPdfUrl?: string;
  internalPdfUrl?: string;
  shareHtmlUrl?: string;
}

export interface ShareToken {
  quoteId: string;
  expiresAt: string;
}
