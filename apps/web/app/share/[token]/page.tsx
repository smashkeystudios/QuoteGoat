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
body{font-family:'DM Mono',monospace;background:#f5f2ec;color:#0f0e0c;font-size:15px;line-height:1.6}

/* ── Outer shell ── */
.page{min-height:100vh;display:flex;flex-direction:column}
.hdr{background:#0f0e0c;color:#f5f2ec;padding:14px 32px;display:flex;justify-content:space-between;align-items:center}
.brand{font-family:'Instrument Serif',serif;font-size:20px;letter-spacing:-0.01em}
.brand-sub{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#8a8070}
.body{flex:1;max-width:1100px;margin:0 auto;width:100%;padding:40px 32px 80px}

/* ── Hero: title left, totals right ── */
.hero{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;border-bottom:2px solid #0f0e0c;padding-bottom:28px;margin-bottom:36px}
.hero-title{font-family:'Instrument Serif',serif;font-size:48px;font-weight:400;letter-spacing:-0.02em;line-height:1.05}
.hero-sub{font-family:'Instrument Serif',serif;font-size:24px;color:#c84b2f;font-style:italic;margin-top:4px}
.hero-total{text-align:right;flex-shrink:0}
.hero-total-lbl{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267;margin-bottom:6px}
.hero-total-amt{font-family:'Instrument Serif',serif;font-size:56px;color:#c84b2f;line-height:1}
.hero-mo{font-family:'Instrument Serif',serif;font-size:22px;color:#1d5c3a;margin-top:4px}
.hero-mo-lbl{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#1d5c3a}

/* ── Two-col content area ── */
.cols{display:grid;grid-template-columns:260px 1fr;gap:32px;align-items:start}

/* ── Meta sidebar ── */
.meta-panel{background:#ede8df;padding:20px}
.meta-panel-lbl{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267;margin-bottom:14px}
.meta-row{padding:8px 0;border-bottom:1px solid #d4cfc5}
.meta-row:last-child{border-bottom:none}
.meta-row-lbl{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7267;margin-bottom:2px}
.meta-row-val{font-size:14px;color:#0f0e0c}

/* ── Investment table ── */
.invest-panel{}
.section-lbl{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:16px}
.tbl{width:100%;border-collapse:collapse;margin-bottom:24px}
.tbl th{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;border-bottom:2px solid #0f0e0c;padding:0 0 10px}
.tbl th.right,.tbl td.right{text-align:right}
.tbl td{padding:12px 0;font-size:16px;vertical-align:middle;border-bottom:1px solid #e4ddd3}
.tbl td.amt{font-family:'Instrument Serif',serif;font-size:24px}
.base-row td{padding:12px 10px;background:#f0ece3;border-bottom:2px solid #0f0e0c}
.feat-cell{display:flex;flex-direction:column;gap:3px}
.tier-badge{display:inline-block;padding:2px 9px;font-size:10px;letter-spacing:0.07em;margin-bottom:3px}
.feat-name{font-size:17px}
.feat-tip{font-size:14px;color:#7a7267}
.tbl-foot{border-top:2px solid #0f0e0c;padding-top:16px;display:flex;justify-content:space-between;align-items:baseline}
.tbl-foot-lbl{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267}
.tbl-foot-amt{font-family:'Instrument Serif',serif;font-size:44px;color:#c84b2f;line-height:1}
.mo-row{display:flex;justify-content:space-between;align-items:baseline;padding:12px 0;border-top:1px solid #d4cfc5;margin-top:12px}
.mo-lbl{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#1d5c3a}
.mo-amt{font-family:'Instrument Serif',serif;font-size:32px;color:#1d5c3a}
.mo-unit{font-size:14px;color:#7a7267}

/* ── Footer ── */
.foot{margin-top:48px;padding-top:20px;border-top:1px solid #d4cfc5;font-size:12px;color:#7a7267;line-height:2;letter-spacing:0.03em}
.foot-brand{margin-top:8px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase}

/* ── Mobile: single column ── */
@media(max-width:700px){
  .hdr{padding:12px 16px}
  .body{padding:24px 16px 60px}
  .hero{grid-template-columns:1fr;gap:16px}
  .hero-title{font-size:32px}
  .hero-sub{font-size:18px}
  .hero-total{text-align:left}
  .hero-total-amt{font-size:40px}
  .cols{grid-template-columns:1fr}
  .meta-panel{margin-bottom:0}
}
@media print{body{background:white}.hdr{background:#0f0e0c!important;-webkit-print-color-adjust:exact}}
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
  const syntheticTiers = [1, 2, 3].map((id) => ({
    id, label: `Tier ${id}`, cls: `t${id}` as "t1" | "t2" | "t3", tooltip: "",
    features: features
      .filter((f) => f.tier === id)
      .map((f) => ({ id: f.id, name: f.name, tip: f.tip ?? "", tierId: id, sortOrder: 0 })),
  }));
  const Q = computeQuote({
    ct, sel: new Set(sel), cx, trf,
    config: pricingSnapshot,
    tiers: syntheticTiers,
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap">
<style>${shareStyles}</style>
</head><body>
<div class="page">
  <header class="hdr">
    <div class="brand">QuoteGoat</div>
    <div class="brand-sub">Powered by Jakomu Incorporated</div>
  </header>

  <div class="body">
    <!-- Hero: project name left, total right -->
    <div class="hero">
      <div>
        <div class="hero-title">${info.project || "Project"}</div>
        <div class="hero-sub">Proposal</div>
      </div>
      <div class="hero-total">
        <div class="hero-total-lbl">Total Upfront</div>
        <div class="hero-total-amt">${fmt(computed.total)}</div>
        ${hasMonthly ? `<div class="hero-mo-lbl">Monthly</div><div class="hero-mo">${fmt(computed.mo)}<span style="font-size:14px;color:#7a7267">/mo</span></div>` : ""}
      </div>
    </div>

    <!-- Two-col: sidebar meta + investment table -->
    <div class="cols">
      <!-- Sidebar -->
      <div class="meta-panel">
        <div class="meta-panel-lbl">Proposal Details</div>
        <div class="meta-row">
          <div class="meta-row-lbl">Prepared for</div>
          <div class="meta-row-val">${info.name || "Client"}</div>
        </div>
        <div class="meta-row">
          <div class="meta-row-lbl">Date</div>
          <div class="meta-row-val">${info.date}</div>
        </div>
        <div class="meta-row">
          <div class="meta-row-lbl">Contract</div>
          <div class="meta-row-val">${ctLabel}</div>
        </div>
        <div class="meta-row">
          <div class="meta-row-lbl">Features</div>
          <div class="meta-row-val">${sel.length} item${sel.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="meta-row">
          <div class="meta-row-lbl">Expires</div>
          <div class="meta-row-val">${expiryDate}</div>
        </div>
      </div>

      <!-- Investment table -->
      <div class="invest-panel">
        <div class="section-lbl">Investment Breakdown</div>
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

        <div class="tbl-foot">
          <span class="tbl-foot-lbl">Total Upfront</span>
          <span class="tbl-foot-amt">${fmt(computed.total)}</span>
        </div>

        ${hasMonthly ? `
        <div class="mo-row">
          <span class="mo-lbl">Monthly Retainer</span>
          <span class="mo-amt">${fmt(computed.mo)}<span class="mo-unit">/mo</span></span>
        </div>` : ""}
      </div>
    </div>

    <footer class="foot">
      <div>This proposal is valid until <strong>${expiryDate}</strong>. All prices exclude applicable taxes.</div>
      <div class="foot-brand">Prepared by Jakomu Incorporated · QuoteGoat</div>
    </footer>
  </div>
</div>
</body></html>`;
}
