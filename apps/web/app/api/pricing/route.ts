export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import { DEF_PRICING } from "@/lib/constants";
import type { PricingConfig } from "@/lib/types";

const KEY = "pricing:config";

export async function GET() {
  let config = await getKV<PricingConfig>(KEY);
  if (!config) {
    config = DEF_PRICING as PricingConfig;
    await setKV(KEY, config);
  }
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const body = await req.json();
  let config = await getKV<PricingConfig>(KEY);
  if (!config) config = DEF_PRICING as PricingConfig;

  const updated: PricingConfig = {
    ...config,
    ...(body.handoff && { handoff: { ...config.handoff, ...body.handoff } }),
    ...(body.hosted && { hosted: { ...config.hosted, ...body.hosted } }),
    ...(body.mods && { mods: body.mods }),
    ...(body.baseCommission !== undefined && { baseCommission: body.baseCommission }),
    ...(body.cxRate !== undefined && { cxRate: body.cxRate }),
    ...(body.trfRate !== undefined && { trfRate: body.trfRate }),
  };
  await setKV(KEY, updated);
  return NextResponse.json(updated);
}
