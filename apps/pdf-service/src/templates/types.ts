export interface PdfPayload {
  quoteInfo: { name: string; project: string; date: string };
  contractType: "handoff" | "hosted";
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
  featureRows: Array<{
    id: string;
    name: string;
    tier: number;
    tierLabel: string;
    tip: string;
    basePrice: number;
    commission: number;
    finalPrice: number;
    monthlyPrice?: number;
  }>;
  quoteId?: string;
  validityDays?: number;
}
