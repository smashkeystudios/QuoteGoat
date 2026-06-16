export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import type { Template } from "@/lib/types";

const KEY = "templates:all";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json();
  const templates = await getKV<Template[]>(KEY);
  if (!templates) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const idx = templates.findIndex((t) => t.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Template = { ...templates[idx], ...patch, id: params.id };
  templates[idx] = updated;
  await setKV(KEY, templates);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const templates = await getKV<Template[]>(KEY);
  if (templates) {
    await setKV(KEY, templates.filter((t) => t.id !== params.id));
  }
  return new NextResponse(null, { status: 204 });
}
