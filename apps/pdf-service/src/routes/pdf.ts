import { Router, Request, Response } from "express";
import { getBrowser } from "../browser";
import { clientPdfHtml } from "../templates/clientPdf";
import { internalPdfHtml } from "../templates/internalPdf";
import type { PdfPayload } from "../templates/types";

const router = Router();

async function generatePdf(html: string, res: Response) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment",
    });
    res.send(pdf);
  } finally {
    await page.close();
  }
}

router.post("/client", async (req: Request, res: Response) => {
  try {
    const payload = req.body as PdfPayload;
    const html = clientPdfHtml(payload);
    await generatePdf(html, res);
  } catch (err) {
    console.error("PDF client error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

router.post("/internal", async (req: Request, res: Response) => {
  try {
    const payload = req.body as PdfPayload;
    const html = internalPdfHtml(payload);
    await generatePdf(html, res);
  } catch (err) {
    console.error("PDF internal error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

export default router;
