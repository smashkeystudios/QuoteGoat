export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import { TIERS, DEF_PRICING } from "@/lib/constants";
import type { Tier, Feature } from "@/lib/types";

const KEY = "features:tiers";

async function seedAndGet(): Promise<Tier[]> {
  const existing = await getKV<Tier[]>(KEY);
  if (existing) return existing;
  await setKV(KEY, TIERS);
  return TIERS;
}

export async function GET() {
  const tiers = await seedAndGet();
  return NextResponse.json(tiers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, tip = "", tierId } = body;
  if (!name || !tierId) return NextResponse.json({ error: "Missing name or tierId" }, { status: 400 });

  const tiers = await seedAndGet();
  const id = "f" + Date.now();
  const tier = tiers.find((t) => t.id === tierId);
  if (!tier) return NextResponse.json({ error: "Tier not found" }, { status: 404 });

  const sortOrder = (tier.features.at(-1)?.sortOrder ?? 0) + 1;
  const feature: Feature = { id, name, tip, tierId, sortOrder };

  const updated = tiers.map((t) =>
    t.id === tierId ? { ...t, features: [...t.features, feature] } : t
  );
  await setKV(KEY, updated);

  const pricing = await getKV<typeof DEF_PRICING>("pricing:config");
  if (pricing) {
    pricing.mods[id] = 30;
    await setKV("pricing:config", pricing);
  }

  return NextResponse.json(feature, { status: 201 });
}
