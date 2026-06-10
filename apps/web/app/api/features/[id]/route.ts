export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import type { Tier } from "@/lib/types";

const KEY = "features:tiers";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const tiers = await getKV<Tier[]>(KEY);
  if (!tiers) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let updated: typeof tiers | null = null;
  const { name, tip, tierId, sortOrder } = body;

  const newTiers = tiers.map((t) => ({
    ...t,
    features: t.features.map((f) => {
      if (f.id !== params.id) return f;
      updated = newTiers;
      return {
        ...f,
        ...(name !== undefined && { name }),
        ...(tip !== undefined && { tip }),
        ...(tierId !== undefined && { tierId }),
        ...(sortOrder !== undefined && { sortOrder }),
      };
    }),
  }));

  await setKV(KEY, newTiers);
  const feat = newTiers.flatMap((t) => t.features).find((f) => f.id === params.id);
  return NextResponse.json(feat);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const tiers = await getKV<Tier[]>(KEY);
  if (!tiers) return new NextResponse(null, { status: 204 });

  const newTiers = tiers.map((t) => ({
    ...t,
    features: t.features.filter((f) => f.id !== params.id),
  }));
  await setKV(KEY, newTiers);

  const pricing = await getKV<{ mods: Record<string, number> }>("pricing:config");
  if (pricing) {
    delete pricing.mods[params.id];
    await setKV("pricing:config", pricing);
  }

  return new NextResponse(null, { status: 204 });
}
