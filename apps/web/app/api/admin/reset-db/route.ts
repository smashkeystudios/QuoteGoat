export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// One-shot DB cleanup — deletes everything except pricing:config
// Protected by a secret token to prevent accidental calls in production
export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({}));
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allKeys = await kv.keys("*");
  const toDelete = allKeys.filter((k) => k !== "pricing:config");

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, kept: ["pricing:config"] });
  }

  await Promise.all(toDelete.map((k) => kv.del(k)));

  return NextResponse.json({
    deleted: toDelete.length,
    deletedKeys: toDelete,
    kept: ["pricing:config"],
  });
}
