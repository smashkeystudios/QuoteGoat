export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, delKV, removeFromList, setKV } from "@/lib/kv";
import type { SavedQuote } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const quote = await getKV<SavedQuote>(`quote:${params.id}`);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json();
  const quote = await getKV<SavedQuote>(`quote:${params.id}`);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = { ...quote, ...patch };
  await setKV(`quote:${params.id}`, updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await delKV(`quote:${params.id}`);
  await removeFromList<string>("quotes:index", (id) => id === params.id);
  return new NextResponse(null, { status: 204 });
}
