export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClientPdfDoc } from "@/lib/pdf/clientTemplate";
import { InternalPdfDoc } from "@/lib/pdf/internalTemplate";
import type { PdfPayload } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { type: string } }) {
  const { type } = params;
  if (type !== "client" && type !== "internal") {
    return Response.json({ error: "Unknown type" }, { status: 400 });
  }

  const payload: PdfPayload = await req.json();

  try {
    const doc = type === "client"
      ? createElement(ClientPdfDoc, { payload })
      : createElement(InternalPdfDoc, { payload });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(doc as any);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(payload.quoteInfo.project || "quote").replace(/[^a-z0-9]/gi, "_")}_${type}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
