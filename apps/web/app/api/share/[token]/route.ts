export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import type { SavedQuote, ShareToken } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const share = await getKV<ShareToken>(`share:${params.token}`);
  if (!share) return NextResponse.json({ error: "Expired or invalid" }, { status: 404 });

  const quote = await getKV<SavedQuote>(`quote:${share.quoteId}`);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  return NextResponse.json({ quote, expiresAt: share.expiresAt });
}
