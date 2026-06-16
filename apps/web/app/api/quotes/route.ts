export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV, prependToList } from "@/lib/kv";
import type { SavedQuote } from "@/lib/types";

export async function GET() {
  const index = (await getKV<string[]>("quotes:index")) ?? [];
  const quotes = await Promise.all(
    index.map((id) => getKV<SavedQuote>(`quote:${id}`))
  );
  return NextResponse.json(quotes.filter(Boolean));
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = "q_" + Date.now();
  const quote: SavedQuote = {
    id,
    savedAt: new Date().toISOString(),
    info: body.info,
    ct: body.ct,
    cx: body.cx,
    trf: body.trf,
    royalty: body.royalty ?? 0,
    sel: body.sel,
    features: body.features ?? [],
    notes: body.notes ?? [],
    pricingSnapshot: body.pricingSnapshot,
    computed: { ...body.computed, moFinal: body.computed?.moFinal ?? body.computed?.mo ?? 0 },
  };
  await setKV(`quote:${id}`, quote);
  await prependToList("quotes:index", id);
  return NextResponse.json(quote, { status: 201 });
}
