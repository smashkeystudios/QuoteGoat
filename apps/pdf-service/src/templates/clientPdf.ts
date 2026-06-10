import type { PdfPayload } from "./types";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">`;

const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'DM Mono',monospace;background:#f5f2ec;color:#0f0e0c;font-size:11px;line-height:1.5}
.page{width:210mm;min-height:297mm;padding:18mm 18mm 14mm;position:relative;page-break-after:always;overflow:hidden}
.page:last-child{page-break-after:avoid}
.page-inner{height:100%;display:flex;flex-direction:column}
@media print{.page{padding:18mm 18mm 14mm}}
`;

const TIER_COLORS: Record<number, string> = { 1: "#4a7c59", 2: "#7a6b3a", 3: "#6b3a4a" };
const TIER_BG: Record<number, string>     = { 1: "#eef3ef", 2: "#f3f0e8", 3: "#f3eaed" };

function cxLabel(cx: number): string {
  const labels = ["", "Minimal", "Low", "Medium", "High", "Enterprise"];
  return labels[cx] ?? cx.toString();
}

export function clientPdfHtml(payload: PdfPayload): string {
  const { quoteInfo, contractType, complexity, computed, featureRows, validityDays = 30 } = payload;
  const client = quoteInfo.name || "Client";
  const project = quoteInfo.project || "Project";
  const date = quoteInfo.date;
  const ctLabel = contractType === "handoff" ? "Handoff" : "Hosted Retainer";
  const hasMonthly = contractType === "hosted" && computed.mo > 0;

  // Group features by tier
  const byTier: Record<number, typeof featureRows> = {};
  for (const r of featureRows) {
    if (!byTier[r.tier]) byTier[r.tier] = [];
    byTier[r.tier].push(r);
  }

  // --- PAGE 1: COVER ---
  const coverPage = `
<div class="page" style="background:#f5f2ec;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:40px">QuoteGoat · Powered by Jakomu Incorporated</div>
    <div style="font-family:'Instrument Serif',serif;font-size:54px;font-weight:400;line-height:1.05;letter-spacing:-0.02em;max-width:480px">
      ${project}<br><em style="color:#c84b2f">Proposal</em>
    </div>
    <div style="margin-top:28px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7267;line-height:2.4">
      Prepared for: <span style="color:#0f0e0c">${client}</span><br>
      Date: <span style="color:#0f0e0c">${date}</span><br>
      Contract: <span style="color:#0f0e0c">${ctLabel}</span>
    </div>
  </div>
  <div>
    <div style="border-top:3px solid #c84b2f;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>
        <div style="font-family:'Instrument Serif',serif;font-size:18px">Jakomu Incorporated</div>
        <div style="font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;margin-top:2px">Powered by QuoteGoat</div>
      </div>
      <div style="text-align:right;font-size:9px;color:#7a7267;letter-spacing:0.05em">
        Prepared exclusively<br>for ${client}
      </div>
    </div>
  </div>
</div>`;

  // --- PAGE 2: SCOPE ---
  const scopeBullets = featureRows.map((r) => `
    <div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #e4ddd3">
      <div style="flex:none;width:56px;padding:2px 6px;background:${TIER_BG[r.tier] ?? "#f0ece3"};color:${TIER_COLORS[r.tier] ?? "#555"};font-size:8px;letter-spacing:0.1em;text-align:center;align-self:flex-start;white-space:nowrap">${r.tierLabel}</div>
      <div style="flex:1">
        <div style="font-weight:500">${r.name}</div>
        ${r.tip ? `<div style="color:#7a7267;font-size:10px;margin-top:2px">${r.tip}</div>` : ""}
      </div>
    </div>`).join("");

  const scopePage = `
<div class="page">
  <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Project Scope</div>
  <div style="font-family:'Instrument Serif',serif;font-size:32px;font-weight:400;letter-spacing:-0.01em;margin-bottom:20px">${project}</div>
  <div style="display:flex;gap:18px;margin-bottom:28px">
    <div style="padding:6px 12px;background:#e4ddd3;font-size:9px;letter-spacing:0.12em;text-transform:uppercase">${ctLabel}</div>
    <div style="padding:6px 12px;background:#e4ddd3;font-size:9px;letter-spacing:0.12em;text-transform:uppercase">Complexity: ${cxLabel(complexity)}</div>
  </div>
  <div style="font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;margin-bottom:16px">Included Deliverables — ${featureRows.length} Feature${featureRows.length !== 1 ? "s" : ""}</div>
  ${featureRows.length > 0 ? scopeBullets : `<div style="color:#7a7267;font-style:italic;padding:18px 0">Base contract — no individual features selected.</div>`}
</div>`;

  // --- PAGE 3: INVESTMENT ---
  const featureTableRows = Object.entries(byTier).map(([tierNum, rows]) => {
    const n = Number(tierNum);
    const header = `<tr style="background:${TIER_BG[n] ?? "#f0ece3"}"><td colspan="2" style="padding:7px 10px;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:${TIER_COLORS[n] ?? "#555"}">${rows[0]?.tierLabel ?? `Tier ${n}`}</td></tr>`;
    const dataRows = rows.map((r) => `
<tr style="border-bottom:1px solid #e4ddd3">
  <td style="padding:8px 10px">${r.name}</td>
  <td style="text-align:right;padding:8px 10px;font-family:'Instrument Serif',serif;font-size:15px">${fmt(r.finalPrice)}</td>
</tr>`).join("");
    return header + dataRows;
  }).join("");

  const investmentPage = `
<div class="page">
  <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Investment</div>
  <div style="font-family:'Instrument Serif',serif;font-size:32px;font-weight:400;letter-spacing:-0.01em;margin-bottom:24px">Project Investment</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr style="border-bottom:2px solid #0f0e0c">
      <th style="text-align:left;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;padding-bottom:7px">Item</th>
      <th style="text-align:right;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;padding-bottom:7px">Investment</th>
    </tr>
    <tr style="background:#f0ece3;border-bottom:1px solid #d4cfc5">
      <td style="padding:10px 10px;font-weight:500">Base Contract</td>
      <td style="text-align:right;padding:10px 10px;font-family:'Instrument Serif',serif;font-size:16px">${fmt(computed.bc)}</td>
    </tr>
    ${featureTableRows}
  </table>

  <div style="border-top:2px solid #0f0e0c;padding-top:14px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
      <div style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267">Total Upfront Investment</div>
      <div style="font-family:'Instrument Serif',serif;font-size:48px;color:#c84b2f;line-height:1">${fmt(computed.total)}</div>
    </div>
    ${hasMonthly ? `
    <div style="border-top:1px solid #d4cfc5;padding-top:12px;margin-top:12px;display:flex;justify-content:space-between;align-items:baseline">
      <div style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#1d5c3a">Monthly Retainer</div>
      <div style="font-family:'Instrument Serif',serif;font-size:28px;color:#1d5c3a;line-height:1">${fmt(computed.mo)}<span style="font-size:13px">/mo</span></div>
    </div>` : ""}
  </div>
</div>`;

  // --- PAGE 4: TERMS ---
  const validityDate = new Date(new Date(date).getTime() + validityDays * 86_400_000)
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const termsPage = `
<div class="page" style="display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Terms &amp; Conditions</div>
    <div style="font-family:'Instrument Serif',serif;font-size:32px;font-weight:400;letter-spacing:-0.01em;margin-bottom:24px">Proposal Terms</div>

    <div style="display:flex;flex-direction:column;gap:18px">
      <div>
        <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c84b2f;margin-bottom:5px">Validity</div>
        <div style="color:#4a4540;line-height:1.7">This proposal is valid until <strong>${validityDate}</strong> (${validityDays} days from the date of issue). After this date, pricing is subject to revision.</div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c84b2f;margin-bottom:5px">Scope</div>
        <div style="color:#4a4540;line-height:1.7">The investment outlined covers the specific features and deliverables described in this proposal. Any additional features or significant scope changes will be quoted separately and require written agreement.</div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c84b2f;margin-bottom:5px">Payment</div>
        <div style="color:#4a4540;line-height:1.7">Payment terms will be outlined in the formal service agreement. Typical terms include a 50% deposit upon project commencement with the remainder due upon delivery.</div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c84b2f;margin-bottom:5px">Revisions</div>
        <div style="color:#4a4540;line-height:1.7">Two rounds of revisions are included for each major deliverable. Additional revision rounds are available at our standard hourly rate.</div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c84b2f;margin-bottom:5px">Taxes</div>
        <div style="color:#4a4540;line-height:1.7">All prices listed exclude applicable taxes. Taxes will be applied in accordance with applicable law and will be itemised in final invoices.</div>
      </div>
    </div>
  </div>

  <div style="border-top:3px solid #c84b2f;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end">
    <div>
      <div style="font-family:'Instrument Serif',serif;font-size:16px">Jakomu Incorporated</div>
      <div style="font-size:9px;letter-spacing:0.08em;color:#7a7267;margin-top:2px">Powered by QuoteGoat</div>
    </div>
    <div style="text-align:right;font-size:9px;color:#7a7267;letter-spacing:0.05em">Prepared for ${client}<br>${date}</div>
  </div>
</div>`;

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>${project} — Proposal</title>
${FONTS}
<style>${BASE_CSS}</style>
</head><body>
${coverPage}
${scopePage}
${investmentPage}
${termsPage}
</body></html>`;
}
