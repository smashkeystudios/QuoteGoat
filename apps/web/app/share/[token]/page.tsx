import { notFound } from "next/navigation";
import { getKV, setKV } from "@/lib/kv";
import { uploadBlob, blobExists } from "@/lib/blob";
import { computeQuote, fmt } from "@/lib/calc";
import type { SavedQuote, ShareToken } from "@/lib/types";

export const dynamic = "force-dynamic";

const TIER_COLORS: Record<number, string> = { 1: "#4a7c59", 2: "#7a6b3a", 3: "#6b3a4a" };
const TIER_BG: Record<number, string>     = { 1: "#eef3ef", 2: "#f3f0e8", 3: "#f3eaed" };

const shareStyles = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Mono',monospace;background:#f5f2ec;color:#0f0e0c;font-size:13px;line-height:1.6}
.wrap{max-width:720px;margin:0 auto;padding:40px 24px 60px}
.hdr{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:16px;border-bottom:2px solid #0f0e0c;margin-bottom:36px}
.brand{font-family:'Instrument Serif',serif;font-size:22px}
.brand-sub{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267}
.cover{margin-bottom:40px}
.cover-title{font-family:'Instrument Serif',serif;font-size:40px;font-weight:400;letter-spacing:-0.02em;line-height:1.1}
.cover-sub{font-family:'Instrument Serif',serif;font-size:40px;color:#c84b2f;font-style:italic;line-height:1.1;margin-bottom:20px}
.meta{display:grid;grid-template-columns:1fr;gap:0}
.meta-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e4ddd3;font-size:12px}
.meta-row span:first-child{color:#7a7267;text-transform:uppercase;letter-spacing:0.08em;font-size:10px}
.section{margin-bottom:36px}
.section-label{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:14px}
.tbl{width:100%;border-collapse:collapse;margin-bottom:20px}
.tbl th{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;border-bottom:2px solid #0f0e0c;padding-bottom:8px;text-align:left}
.tbl th.right,.tbl td.right{text-align:right}
.tbl td{padding:10px 0;font-size:12px;vertical-align:middle}
.tbl td.amt{font-family:'Instrument Serif',serif;font-size:17px}
.base-row td{padding:10px 8px;background:#f0ece3}
.feat-cell{display:flex;flex-direction:column;gap:2px}
.tier-badge{display:inline-block;padding:2px 8px;font-size:9px;letter-spacing:0.08em;margin-bottom:3px}
.feat-name{font-size:12px}
.feat-tip{font-size:10px;color:#7a7267}
.total-row{display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid #0f0e0c;padding-top:14px;margin-bottom:12px}
.total-lbl{font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267}
.total-amt{font-family:'Instrument Serif',serif;font-size:48px;color:#c84b2f;line-height:1}
.mo-row{display:flex;justify-content:space-between;align-items:baseline;padding:10px 0;border-top:1px solid #d4cfc5}
.mo-lbl{font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#1d5c3a}
.mo-amt{font-family:'Instrument Serif',serif;font-size:28px;color:#1d5c3a}
.mo-unit{font-size:13px;color:#7a7267}
.foot{padding-top:20px;border-top:1px solid #d4cfc5;font-size:11px;color:#7a7267;line-height:2;letter-spacing:0.04em}
.foot-brand{margin-top:8px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase}
@media(max-width:600px){.wrap{padding:24px 16px 48px}.cover-title,.cover-sub{font-size:30px}.total-amt{font-size:36px}}
@media print{body{background:white}.wrap{max-width:100%;padding:20mm}}
`;

export default async function SharePage({ params }: { params: { token: string } }) {
  const share = await getKV<ShareToken>(`share:${params.token}`);
  if (!share) notFound();

  const quote = await getKV<SavedQuote>(`quote:${share.quoteId}`);
  if (!quote) notFound();

  const html = buildHtml(quote, share.expiresAt);

  const snapshotPath = `quotes/${quote.id}/share.html`;
  const hasSnapshot = await blobExists(snapshotPath);
  if (!hasSnapshot) {
    try {
      const url = await uploadBlob(snapshotPath, Buffer.from(html, "utf-8"), "text/html");
      const updated = { ...quote, shareHtmlUrl: url };
      await setKV(`quote:${quote.id}`, updated);
    } catch {
      // best-effort — don't fail the page render
    }
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function buildHtml(quote: SavedQuote, expiresAt: string): string {
  const { info, ct, cx, trf, sel, features, pricingSnapshot, computed } = quote;
  const Q = computeQuote({
    ct, sel: new Set(sel), cx, trf,
    config: pricingSnapshot,
    tiers: [],
  });

  const ctLabel = ct === "handoff" ? "Handoff" : "Hosted Retainer";
  const hasMonthly = ct === "hosted" && computed.mo > 0;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const featureMap = Object.fromEntries(features.map((f) => [f.id, f]));

  const featureRows = sel.map((fid) => {
    const f = featureMap[fid];
    const tierNum = f?.tier ?? 1;
    const tierLabel = f?.tierLabel ?? `Tier ${tierNum}`;
    const finalPrice = Q.finalUp(fid);
    const moPrice = ct === "hosted" ? Q.moFeat(fid) : 0;
    return `
    <tr style="border-bottom:1px solid #e4ddd3">
      <td>
        <div class="feat-cell">
          <span class="tier-badge" style="background:${TIER_BG[tierNum]};color:${TIER_COLORS[tierNum]}">${tierLabel}</span>
          <span class="feat-name">${f?.name ?? fid}</span>
          ${f?.tip ? `<span class="feat-tip">${f.tip}</span>` : ""}
        </div>
      </td>
      <td class="right amt">${fmt(finalPrice)}${hasMonthly && moPrice > 0 ? `<br><span style="font-size:11px;color:#1d5c3a">${fmt(moPrice)}/mo</span>` : ""}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${info.project || "Proposal"} — QuoteGoat</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap">
<style>${shareStyles}</style>
</head><body>
<div class="wrap">
  <header class="hdr">
    <div class="brand">QuoteGoat</div>
    <div class="brand-sub">Powered by Jakomu Incorporated</div>
  </header>

  <div class="cover">
    <div class="cover-title">${info.project || "Project"}</div>
    <div class="cover-sub">Proposal</div>
    <div class="meta">
      <div class="meta-row"><span>Prepared for</span><span>${info.name || "Client"}</span></div>
      <div class="meta-row"><span>Date</span><span>${info.date}</span></div>
      <div class="meta-row"><span>Contract</span><span>${ctLabel}</span></div>
    </div>
  </div>

  <section class="section">
    <div class="section-label">Investment Summary</div>
    <table class="tbl">
      <thead>
        <tr>
          <th>Item</th>
          <th class="right">Investment</th>
        </tr>
      </thead>
      <tbody>
        <tr class="base-row">
          <td><strong>Base Contract</strong></td>
          <td class="right amt">${fmt(computed.bc)}</td>
        </tr>
        ${featureRows}
      </tbody>
    </table>

    <div class="total-row">
      <span class="total-lbl">Total Upfront</span>
      <span class="total-amt">${fmt(computed.total)}</span>
    </div>

    ${hasMonthly ? `
    <div class="mo-row">
      <span class="mo-lbl">Monthly Retainer</span>
      <span class="mo-amt">${fmt(computed.mo)}<span class="mo-unit">/mo</span></span>
    </div>` : ""}
  </section>

  <footer class="foot">
    <div>This proposal expires on <strong>${expiryDate}</strong>.</div>
    <div>All prices exclude applicable taxes.</div>
    <div class="foot-brand">Prepared by Jakomu Incorporated · QuoteGoat</div>
  </footer>
</div>
</body></html>`;
}
