export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import type { Template } from "@/lib/types";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const templates = await getKV<Template[]>("templates:all");
  if (templates) {
    const updated = templates.filter((t) => t.id !== params.id || t.isPreset);
    await setKV("templates:all", updated);
  }
  return new NextResponse(null, { status: 204 });
}
