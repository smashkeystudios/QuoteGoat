import type { PdfPayload } from "./types";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">`;

function cxLabel(cx: number): string {
  const labels = ["", "Minimal", "Low", "Medium", "High", "Enterprise"];
  return labels[cx] ?? cx.toString();
}

const INTERNAL_BANNER = `<div style="background:#8b1a1a;color:white;padding:6px 18mm;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin:0 -18mm 14px;position:relative">⚠ INTERNAL — NOT FOR CLIENT DISTRIBUTION</div>`;

const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'DM Mono',monospace;background:#f5f2ec;color:#0f0e0c;font-size:11px;line-height:1.5}
.page{width:210mm;min-height:297mm;padding:0 18mm 14mm;position:relative;page-break-after:always;overflow:hidden}
.page-content{padding-top:14px}
.page:last-child{page-break-after:avoid}
@media print{.page{padding:0 18mm 14mm}}
`;

export function internalPdfHtml(payload: PdfPayload): string {
  const { quoteInfo, contractType, complexity, traffic, computed, featureRows, validityDays = 30 } = payload;
  const client = quoteInfo.name || "Client";
  const project = quoteInfo.project || "Project";
  const date = quoteInfo.date;
  const ctLabel = contractType === "handoff" ? "Handoff" : "Hosted Retainer";
  const hasMonthly = contractType === "hosted" && computed.mo > 0;
  const marginPct = computed.totalNoMod > 0
    ? (((computed.total - computed.totalNoMod) / computed.totalNoMod) * 100).toFixed(1)
    : "0.0";

  // --- PAGE 1: INTERNAL COVER ---
  const coverPage = `
<div class="page" style="background:#f5f2ec;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    ${INTERNAL_BANNER}
    <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:32px">Internal Summary · QuoteGoat</div>
    <div style="font-family:'Instrument Serif',serif;font-size:46px;font-weight:400;line-height:1.05;letter-spacing:-0.02em;max-width:480px">
      ${project}<br><em style="color:#8b1a1a">Internal<br>Analysis</em>
    </div>
    <div style="margin-top:28px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7267;line-height:2.4">
      Client: <span style="color:#0f0e0c">${client}</span><br>
      Date: <span style="color:#0f0e0c">${date}</span><br>
      Contract: <span style="color:#0f0e0c">${ctLabel}</span>
    </div>
  </div>
  <div>
    <div style="border-top:3px solid #8b1a1a;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end">
      <div>
        <div style="font-family:'Instrument Serif',serif;font-size:16px">Jakomu Incorporated</div>
        <div style="font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;margin-top:2px">Internal Use Only</div>
      </div>
      <div style="text-align:right;font-size:9px;color:#8b1a1a;letter-spacing:0.05em;font-weight:500">CONFIDENTIAL</div>
    </div>
  </div>
</div>`;

  // --- PAGE 2: MULTIPLIERS / CONFIG ---
  const cxMult = (1 + (complexity - 1) * 0.15).toFixed(3);
  const trfMult = (1 + (traffic - 1) * 0.12).toFixed(3);

  const configPage = `
<div class="page">
  ${INTERNAL_BANNER}
  <div class="page-content">
    <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#8b1a1a;margin-bottom:6px">Pricing Configuration</div>
    <div style="font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;letter-spacing:-0.01em;margin-bottom:20px">Multipliers &amp; Config</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div style="background:#f0ece3;padding:14px">
        <div style="font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Complexity</div>
        <div style="font-family:'Instrument Serif',serif;font-size:28px;color:#0f0e0c">${cxMult}×</div>
        <div style="font-size:10px;color:#7a7267;margin-top:3px">Level ${complexity}/5 — ${cxLabel(complexity)}</div>
      </div>
      ${contractType === "hosted" ? `
      <div style="background:#f0ece3;padding:14px">
        <div style="font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Traffic</div>
        <div style="font-family:'Instrument Serif',serif;font-size:28px;color:#0f0e0c">${trfMult}×</div>
        <div style="font-size:10px;color:#7a7267;margin-top:3px">Level ${traffic}/5</div>
      </div>` : ""}
      <div style="background:#f0ece3;padding:14px">
        <div style="font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;margin-bottom:6px">Base Commission</div>
        <div style="font-family:'Instrument Serif',serif;font-size:28px;color:${computed.bcCommPct > 0 ? "#b8921a" : "#7a7267"}">${computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "None"}</div>
        <div style="font-size:10px;color:#7a7267;margin-top:3px">Applied to base contract</div>
      </div>
    </div>

    <div style="border-top:1px solid #d4cfc5;padding-top:16px">
      <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;margin-bottom:10px">Feature Commission Summary</div>
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:2px solid #0f0e0c">
          <th style="text-align:left;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Feature</th>
          <th style="text-align:right;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Tier</th>
          <th style="text-align:right;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Commission</th>
        </tr>
        ${featureRows.map((r) => `
        <tr style="border-bottom:1px solid #e4ddd3">
          <td style="padding:6px 0">${r.name}</td>
          <td style="text-align:right;padding:6px 0;color:#7a7267;font-size:10px">${r.tierLabel}</td>
          <td style="text-align:right;padding:6px 0;color:${r.commission > 0 ? "#b8921a" : "#7a7267"}">${pct(r.commission)}</td>
        </tr>`).join("")}
      </table>
    </div>
  </div>
</div>`;

  // --- PAGE 3: FULL COST BREAKDOWN ---
  const featureTableRows = featureRows.map((r) => `
<tr style="border-bottom:1px solid #e4ddd3">
  <td style="padding:8px 0">${r.name}</td>
  <td style="text-align:right;padding:8px 0;color:#7a7267;font-size:10px">${r.tierLabel}</td>
  <td style="text-align:right;padding:8px 0;font-family:'Instrument Serif',serif;font-size:14px">${fmt(r.basePrice)}</td>
  <td style="text-align:right;padding:8px 0;color:${r.commission > 0 ? "#b8921a" : "#7a7267"}">${pct(r.commission)}</td>
  <td style="text-align:right;padding:8px 0;font-family:'Instrument Serif',serif;font-size:15px;color:#1d5c3a">${fmt(r.finalPrice)}</td>
  ${hasMonthly ? `<td style="text-align:right;padding:8px 0;color:#1d5c3a;font-size:10px">${r.monthlyPrice ? fmt(r.monthlyPrice) + "/mo" : "—"}</td>` : ""}
</tr>`).join("");

  const breakdownPage = `
<div class="page">
  ${INTERNAL_BANNER}
  <div class="page-content">
    <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#8b1a1a;margin-bottom:6px">Cost Breakdown</div>
    <div style="font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;letter-spacing:-0.01em;margin-bottom:18px">Full Cost Analysis</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr style="border-bottom:2px solid #0f0e0c">
        <th style="text-align:left;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Feature</th>
        <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Tier</th>
        <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Base (×cx)</th>
        <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Modifier</th>
        <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Final</th>
        ${hasMonthly ? `<th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Monthly</th>` : ""}
      </tr>
      <tr style="background:#f0ece3;border-bottom:1px solid #d4cfc5">
        <td style="padding:9px 0;font-weight:500">Base Contract</td>
        <td style="text-align:right;padding:9px 0;color:#7a7267;font-size:10px">—</td>
        <td style="text-align:right;padding:9px 0;font-family:'Instrument Serif',serif;font-size:14px">${fmt(computed.bcRaw)}</td>
        <td style="text-align:right;padding:9px 0;color:${computed.bcCommPct > 0 ? "#b8921a" : "#7a7267"}">${computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "—"}</td>
        <td style="text-align:right;padding:9px 0;font-family:'Instrument Serif',serif;font-size:15px;color:#1d5c3a">${fmt(computed.bc)}</td>
        ${hasMonthly ? `<td style="text-align:right;padding:9px 0;color:#1d5c3a;font-size:10px">${computed.moBase ? fmt(computed.moBase) + "/mo" : "—"}</td>` : ""}
      </tr>
      ${featureTableRows}
    </table>
  </div>
</div>`;

  // --- PAGE 4: MARGIN SUMMARY ---
  const summaryPage = `
<div class="page">
  ${INTERNAL_BANNER}
  <div class="page-content">
    <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#8b1a1a;margin-bottom:6px">Financial Summary</div>
    <div style="font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;letter-spacing:-0.01em;margin-bottom:24px">Margin Analysis</div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr style="border-bottom:1px solid #d4cfc5">
        <td style="padding:11px 0;color:#4a4540">Total before commission</td>
        <td style="text-align:right;font-family:'Instrument Serif',serif;font-size:18px;padding:11px 0">${fmt(computed.totalNoMod)}</td>
      </tr>
      <tr style="border-bottom:1px solid #d4cfc5">
        <td style="padding:11px 0;color:${computed.delta >= 0 ? "#b8921a" : "#c84b2f"}">Commission ${computed.delta >= 0 ? "(markup)" : "(discount)"}</td>
        <td style="text-align:right;font-family:'Instrument Serif',serif;font-size:18px;padding:11px 0;color:${computed.delta >= 0 ? "#b8921a" : "#c84b2f"}">${computed.delta >= 0 ? "+" : ""}${fmt(computed.delta)}</td>
      </tr>
      <tr style="border-bottom:2px solid #0f0e0c">
        <td style="padding:11px 0;font-weight:500">Effective margin</td>
        <td style="text-align:right;font-family:'Instrument Serif',serif;font-size:18px;padding:11px 0;color:${parseFloat(marginPct) >= 0 ? "#b8921a" : "#c84b2f"}">${parseFloat(marginPct) >= 0 ? "+" : ""}${marginPct}%</td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:16px 0;border-bottom:${hasMonthly ? "1px solid #d4cfc5" : "none"}">
      <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267">Client Invoice Total</div>
      <div style="font-family:'Instrument Serif',serif;font-size:52px;color:#c84b2f;line-height:1">${fmt(computed.total)}</div>
    </div>

    ${hasMonthly ? `
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:14px 0;border-bottom:1px solid #d4cfc5">
      <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#1d5c3a">Monthly Retainer</div>
      <div style="font-family:'Instrument Serif',serif;font-size:30px;color:#1d5c3a;line-height:1">${fmt(computed.mo)}<span style="font-size:13px">/mo</span></div>
    </div>
    <div style="font-size:10px;color:#7a7267;margin-top:6px;padding-bottom:14px">
      Monthly breakdown: ${featureRows.filter((r) => r.monthlyPrice).map((r) => `${r.name} ${fmt(r.monthlyPrice ?? 0)}`).join(" · ")}
    </div>
    <div style="margin-bottom:6px">
      <div style="font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#1d5c3a;margin-bottom:10px">Lifetime Customer Value — 5-Year Projection</div>
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:1px solid #d4cfc5">
          <th style="text-align:left;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Period</th>
          <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Recurring</th>
          <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Cumulative</th>
          <th style="text-align:right;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7267;padding-bottom:6px">Total LCV</th>
        </tr>
        ${[1,2,3,4,5].map((yr) => {
          const recurring = computed.mo * 12 * yr;
          const cumulative = recurring;
          const totalLcv = computed.total + cumulative;
          return `<tr style="border-bottom:1px solid #e4ddd3${yr === 5 ? ";background:#eef3ef" : ""}">
            <td style="padding:7px 0;font-size:11px${yr === 5 ? ";font-weight:500" : ""}">Year ${yr}</td>
            <td style="text-align:right;padding:7px 0;font-size:11px;color:#1d5c3a">${fmt(computed.mo * 12)}/yr</td>
            <td style="text-align:right;padding:7px 0;font-family:'Instrument Serif',serif;font-size:${yr === 5 ? "15" : "13"}px;color:#1d5c3a">${fmt(cumulative)}</td>
            <td style="text-align:right;padding:7px 0;font-family:'Instrument Serif',serif;font-size:${yr === 5 ? "16" : "13"}px;color:${yr === 5 ? "#1d5c3a" : "#0f0e0c"}">${fmt(totalLcv)}</td>
          </tr>`;
        }).join("")}
      </table>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:10px 0 0;border-top:2px solid #1d5c3a;margin-top:2px">
        <div style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#1d5c3a">5-Year LCV (upfront + all retainers)</div>
        <div style="font-family:'Instrument Serif',serif;font-size:28px;color:#1d5c3a;line-height:1">${fmt(computed.total + computed.mo * 60)}</div>
      </div>
    </div>` : ""}

    <div style="margin-top:${hasMonthly ? "20" : "28"}px;padding:14px;background:#fff5f5;border:1px solid #f0c0c0">
      <div style="font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:#8b1a1a;margin-bottom:6px">⚠ Confidentiality Notice</div>
      <div style="font-size:10px;color:#5a3030;line-height:1.7">This document contains internal pricing information, commission structures, and margin analysis. It must not be shared with the client or any third party. Prepared ${date} for Jakomu Incorporated internal use only.</div>
    </div>
  </div>
</div>`;

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>INTERNAL — ${project}</title>
${FONTS}
<style>${BASE_CSS}</style>
</head><body>
${coverPage}
${configPage}
${breakdownPage}
${summaryPage}
</body></html>`;
}
