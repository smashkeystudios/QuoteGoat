export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getKV, setKV } from "@/lib/kv";
import type { SavedQuote, ShareToken } from "@/lib/types";

export async function POST(req: Request) {
  const { quoteId, days = 2 } = await req.json();
  const clampedDays = Math.min(14, Math.max(2, Math.round(days)));

  const quote = await getKV<SavedQuote>(`quote:${quoteId}`);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + clampedDays * 86_400_000).toISOString();
  const shareData: ShareToken = { quoteId, expiresAt };

  await setKV(`share:${token}`, shareData, { ex: clampedDays * 86_400 });

  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/share/${token}`;

  return NextResponse.json({ token, url, expiresAt });
}
