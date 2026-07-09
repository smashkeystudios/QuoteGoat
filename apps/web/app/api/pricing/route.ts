export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { setKV } from "@/lib/kv";
import { getLivePricingConfig, PRICING_KEY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/types";

export async function GET() {
  const config = await getLivePricingConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const config = await getLivePricingConfig();

  const updated: PricingConfig = {
    ...config,
    ...(body.handoff && { handoff: { ...config.handoff, ...body.handoff } }),
    ...(body.hosted && { hosted: { ...config.hosted, ...body.hosted } }),
    ...(body.mods && { mods: body.mods }),
    ...(body.baseCommission !== undefined && { baseCommission: body.baseCommission }),
    ...(body.cxRate !== undefined && { cxRate: body.cxRate }),
    ...(body.trfRate !== undefined && { trfRate: body.trfRate }),
  };
  await setKV(PRICING_KEY, updated);
  return NextResponse.json(updated);
}
