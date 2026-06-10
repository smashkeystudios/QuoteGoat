export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getKV, setKV } from "@/lib/kv";
import { PRESET_TEMPLATES } from "@/lib/constants";
import type { Template } from "@/lib/types";

const KEY = "templates:all";

async function seedAndGet(): Promise<Template[]> {
  const existing = await getKV<Template[]>(KEY);
  if (existing) return existing;
  await setKV(KEY, PRESET_TEMPLATES);
  return PRESET_TEMPLATES;
}

export async function GET() {
  const templates = await seedAndGet();
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, desc = "", ct, cx = 1, trf = 1, features = [], baseCommission = 0 } = body;
  if (!name || !ct) return NextResponse.json({ error: "Missing name or ct" }, { status: 400 });

  const id = "c" + Date.now();
  const template: Template = {
    id, name, desc, ct, cx, trf, features, baseCommission,
    isPreset: false, custom: true,
  };
  const templates = await seedAndGet();
  await setKV(KEY, [...templates, template]);
  return NextResponse.json(template, { status: 201 });
}
