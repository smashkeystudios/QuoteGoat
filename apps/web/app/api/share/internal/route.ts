export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getKV, setKV } from "@/lib/kv";
import type { SavedQuote } from "@/lib/types";

export async function POST(req: Request) {
  const { quoteId } = await req.json();
  if (!quoteId) return NextResponse.json({ error: "quoteId required" }, { status: 400 });

  const quote = await getKV<SavedQuote>(`quote:${quoteId}`);
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  const token = randomBytes(24).toString("hex");
  // No TTL — internal links are permanent
  await setKV(`share:int:${token}`, { quoteId });

  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/share/internal/${token}`;

  return NextResponse.json({ token, url });
}
