import { notFound } from "next/navigation";
import { getKV } from "@/lib/kv";
import { computeQuote, fmt, cxM, trfM } from "@/lib/calc";
import type { SavedQuote } from "@/lib/types";

export const dynamic = "force-dynamic";

const intStyles = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Mono',monospace;background:#1a1008;color:#e8e0d0;font-size:15px;line-height:1.6}

/* ── Internal banner ── */
.int-banner{background:#8b1a1a;color:#ffe0e0;padding:10px 32px;display:flex;align-items:center;gap:12px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:500;border-bottom:2px solid #c84b2f}
.int-banner-icon{font-size:16px}

/* ── Outer shell ── */
.page{min-height:100vh;display:flex;flex-direction:column}
.hdr{background:#0f0e0c;color:#f5f2ec;padding:14px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c84b2f}
.brand{font-family:'Instrument Serif',serif;font-size:20px;letter-spacing:-0.01em}
.brand-sub{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#8a8070}
.body{flex:1;max-width:1200px;margin:0 auto;width:100%;padding:40px 32px 80px}

/* ── Hero ── */
.hero{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;border-bottom:2px solid #c84b2f;padding-bottom:28px;margin-bottom:36px}
.hero-title{font-family:'Instrument Serif',serif;font-size:48px;font-weight:400;letter-spacing:-0.02em;line-height:1.05;color:#f5f2ec}
.hero-sub{font-family:'Instrument Serif',serif;font-size:24px;color:#c84b2f;font-style:italic;margin-top:4px}
.hero-tag{display:inline-block;background:#8b1a1a;color:#ffe0e0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;padding:3px 10px;margin-top:10px}
.hero-total{text-align:right;flex-shrink:0}
.hero-total-lbl{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7267;margin-bottom:6px}
.hero-total-amt{font-family:'Instrument Serif',serif;font-size:56px;color:#c84b2f;line-height:1}
.hero-mo{font-family:'Instrument Serif',serif;font-size:22px;color:#4fa874;margin-top:4px}
.hero-mo-lbl{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#4fa874}

/* ── Three-col layout ── */
.cols{display:grid;grid-template-columns:260px 1fr 260px;gap:28px;align-items:start}

/* ── Panels ── */
.panel{background:#211a10;padding:20px;border:1px solid #3a2e1a}
.panel-lbl{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #3a2e1a}
.meta-row{padding:8px 0;border-bottom:1px solid #2e2418}
.meta-row:last-child{border-bottom:none}
.meta-row-lbl{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7267;margin-bottom:2px}
.meta-row-val{font-size:14px;color:#e8e0d0}
.meta-row-val.acc{color:#c84b2f}
.meta-row-val.grn{color:#4fa874}
.meta-row-val.gld{color:#c9a84c}

/* ── Stats panel ── */
.stat-row{padding:10px 0;border-bottom:1px solid #2e2418;display:flex;justify-content:space-between;align-items:baseline}
.stat-row:last-child{border-bottom:none}
.stat-lbl{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7a7267}
.stat-val{font-family:'Instrument Serif',serif;font-size:20px;color:#e8e0d0}
.stat-val.acc{color:#c84b2f}
.stat-val.grn{color:#4fa874}
.stat-val.gld{color:#c9a84c}

/* ── Feature table ── */
.tbl{width:100%;border-collapse:collapse;margin-bottom:24px}
.tbl th{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;border-bottom:2px solid #c84b2f;padding:0 0 10px}
.tbl th.right,.tbl td.right{text-align:right}
.tbl td{padding:12px 8px 12px 0;font-size:15px;vertical-align:top;border-bottom:1px solid #2e2418;color:#e8e0d0}
.tbl td.mono{font-family:'Instrument Serif',serif;font-size:18px}
.tbl td.dim{color:#7a7267;font-size:13px}
.tbl td.gld{font-family:'Instrument Serif',serif;font-size:18px;color:#c9a84c}
.tbl td.red{font-family:'Instrument Serif',serif;font-size:18px;color:#c84b2f}
.base-row td{padding:12px 8px;background:#2a1a0e;border-bottom:2px solid #c84b2f}
.feat-cell{display:flex;flex-direction:column;gap:3px}
.tier-badge{display:inline-block;padding:2px 9px;font-size:10px;letter-spacing:0.07em;margin-bottom:2px}
.feat-name{font-size:16px;color:#e8e0d0}
.feat-tip{font-size:13px;color:#7a7267}

/* ── Totals ── */
.tbl-foot{border-top:2px solid #c84b2f;padding-top:16px;margin-top:8px}
.tbl-foot-row{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0}
.tbl-foot-lbl{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267}
.tbl-foot-amt{font-family:'Instrument Serif',serif;font-size:20px;color:#e8e0d0}
.tbl-foot-amt.acc{color:#c84b2f;font-size:40px}
.tbl-foot-amt.grn{color:#4fa874}
.tbl-foot-amt.gld{color:#c9a84c}

/* ── LCV panel ── */
.lcv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
.lcv-cell{background:#1a1008;padding:12px;border:1px solid #3a2e1a}
.lcv-yr{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267;margin-bottom:4px}
.lcv-amt{font-family:'Instrument Serif',serif;font-size:22px;color:#c9a84c}

/* ── Footer ── */
.foot{margin-top:48px;padding-top:20px;border-top:1px solid #3a2e1a;font-size:12px;color:#7a7267;line-height:2;letter-spacing:0.03em}

/* ── Mobile ── */
@media(max-width:900px){
  .cols{grid-template-columns:1fr}
  .hero{grid-template-columns:1fr;gap:16px}
  .hero-title{font-size:32px}
  .hero-total{text-align:left}
  .hero-total-amt{font-size:40px}
  .int-banner{padding:10px 16px}
  .body{padding:24px 16px 60px}
}
`;

const TIER_COLORS: Record<number, string> = { 1: "#4a7c59", 2: "#7a6b3a", 3: "#6b3a4a" };
const TIER_BG: Record<number, string>     = { 1: "#1a2e20", 2: "#2a2010", 3: "#2a1020" };

export default async function InternalSharePage({ params }: { params: { token: string } }) {
  const data = await getKV<{ quoteId: string }>(`share:int:${params.token}`);
  if (!data) notFound();

  const quote = await getKV<SavedQuote>(`quote:${data.quoteId}`);
  if (!quote) notFound();

  const html = buildInternalHtml(quote);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function buildInternalHtml(quote: SavedQuote): string {
  const { info, ct, cx, trf, sel, features, pricingSnapshot } = quote;

  const syntheticTiers = [1, 2, 3].map((id) => ({
    id, label: `Tier ${id}`, cls: `t${id}` as "t1" | "t2" | "t3", tooltip: "",
    features: features
      .filter((f) => f.tier === id)
      .map((f) => ({ id: f.id, name: f.name, tip: f.tip ?? "", tierId: id, sortOrder: 0 })),
  }));

  const Q = computeQuote({ ct, sel: new Set(sel), cx, trf, config: pricingSnapshot, tiers: syntheticTiers });

  const ctLabel = ct === "handoff" ? "Handoff" : "Hosted Retainer";
  const hasMonthly = ct === "hosted" && Q.mo > 0;
  const featureMap = Object.fromEntries(features.map((f) => [f.id, f]));

  const commPctDisplay = `${(Q.bcCommPct * 100).toFixed(0)}%`;
  const effectiveMargin = Q.total > 0 ? ((Q.delta / Q.total) * 100).toFixed(1) : "0.0";
  const cxRate = (pricingSnapshot.cxRate ?? 15) / 100;
  const trfRate = (pricingSnapshot.trfRate ?? 20) / 100;
  const cxLabel = cx === 1 ? "Standard (×1)" : `${cx} (×${cxM(cx, cxRate).toFixed(2)})`;
  const trfLabel = trf === 1 ? "Standard (×1)" : `${trf} (×${trfM(trf, trfRate).toFixed(2)})`;

  // LCV projections (upfront + recurring)
  const lcv = (months: number) => Q.total + Q.mo * months;

  const featureRows = sel.map((fid) => {
    const f = featureMap[fid];
    const tierNum = f?.tier ?? 1;
    const tierLabel = f?.tierLabel ?? `Tier ${tierNum}`;
    const base = Q.baseUpCx(fid);
    const mod = Q.modPct(fid);
    const final = Q.finalUp(fid);
    const commission = final - base;
    const moPrice = hasMonthly ? Q.moFeat(fid) : 0;
    const modDisplay = mod >= 0 ? `+${(mod * 100).toFixed(0)}%` : `${(mod * 100).toFixed(0)}%`;

    return `
    <tr>
      <td>
        <div class="feat-cell">
          <span class="tier-badge" style="background:${TIER_BG[tierNum]};color:${TIER_COLORS[tierNum]}">${tierLabel}</span>
          <span class="feat-name">${f?.name ?? fid}</span>
          ${f?.tip ? `<span class="feat-tip">${f.tip}</span>` : ""}
        </div>
      </td>
      <td class="right dim">${fmt(base)}</td>
      <td class="right dim">${modDisplay}</td>
      <td class="right gld">${fmt(commission)}</td>
      <td class="right mono">${fmt(final)}${moPrice > 0 ? `<br><span style="font-size:11px;color:#4fa874">${fmt(moPrice)}/mo</span>` : ""}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>[INTERNAL] ${info.project || "Proposal"} — QuoteGoat</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap">
<style>${intStyles}</style>
</head><body>
<div class="page">
  <div class="int-banner">
    <span class="int-banner-icon">⚠</span>
    INTERNAL USE ONLY — Do not share with client · Commission &amp; pricing details visible
  </div>

  <header class="hdr">
    <div class="brand">QuoteGoat</div>
    <div class="brand-sub">Internal View · Jakomu Incorporated</div>
  </header>

  <div class="body">
    <div class="hero">
      <div>
        <div class="hero-title">${info.project || "Project"}</div>
        <div class="hero-sub">${info.name || "Client"}</div>
        <div class="hero-tag">⚠ Internal — Not For Distribution</div>
      </div>
      <div class="hero-total">
        <div class="hero-total-lbl">Total Client Price</div>
        <div class="hero-total-amt">${fmt(Q.total)}</div>
        ${hasMonthly ? `<div class="hero-mo-lbl">Monthly Retainer</div><div class="hero-mo">${fmt(Q.mo)}<span style="font-size:14px;color:#4fa874">/mo</span></div>` : ""}
      </div>
    </div>

    <div class="cols">
      <!-- Left: Quote meta -->
      <div>
        <div class="panel">
          <div class="panel-lbl">Quote Details</div>
          <div class="meta-row">
            <div class="meta-row-lbl">Client</div>
            <div class="meta-row-val">${info.name || "—"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Project</div>
            <div class="meta-row-val">${info.project || "—"}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Date</div>
            <div class="meta-row-val">${info.date}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Contract Type</div>
            <div class="meta-row-val">${ctLabel}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Complexity</div>
            <div class="meta-row-val">${cxLabel}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Traffic</div>
            <div class="meta-row-val">${trfLabel}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Features</div>
            <div class="meta-row-val">${sel.length} selected</div>
          </div>
        </div>

        <div class="panel" style="margin-top:16px">
          <div class="panel-lbl">Commission Breakdown</div>
          <div class="stat-row">
            <span class="stat-lbl">Base Commission %</span>
            <span class="stat-val gld">${commPctDisplay}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Base (before comm.)</span>
            <span class="stat-val">${fmt(Q.bcRaw)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Base (client price)</span>
            <span class="stat-val acc">${fmt(Q.bc)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Features (no modifier)</span>
            <span class="stat-val">${fmt(Q.upBase)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Features (with modifiers)</span>
            <span class="stat-val acc">${fmt(Q.upMod)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Total Modifier Revenue</span>
            <span class="stat-val gld">${fmt(Q.delta)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-lbl">Effective Margin</span>
            <span class="stat-val gld">${effectiveMargin}%</span>
          </div>
        </div>

        ${hasMonthly ? `
        <div class="panel" style="margin-top:16px">
          <div class="panel-lbl">LCV Projections</div>
          <div class="lcv-grid">
            <div class="lcv-cell">
              <div class="lcv-yr">1 Year</div>
              <div class="lcv-amt">${fmt(lcv(12))}</div>
            </div>
            <div class="lcv-cell">
              <div class="lcv-yr">2 Years</div>
              <div class="lcv-amt">${fmt(lcv(24))}</div>
            </div>
            <div class="lcv-cell">
              <div class="lcv-yr">3 Years</div>
              <div class="lcv-amt">${fmt(lcv(36))}</div>
            </div>
            <div class="lcv-cell">
              <div class="lcv-yr">5 Years</div>
              <div class="lcv-amt">${fmt(lcv(60))}</div>
            </div>
          </div>
        </div>` : ""}
      </div>

      <!-- Center: Feature table -->
      <div>
        <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7267;margin-bottom:16px">Investment Breakdown</div>
        <table class="tbl">
          <thead>
            <tr>
              <th>Feature</th>
              <th class="right">Base ×cx</th>
              <th class="right">Modifier</th>
              <th class="right">Comm. Rev.</th>
              <th class="right">Client Price</th>
            </tr>
          </thead>
          <tbody>
            <tr class="base-row">
              <td><strong>Base Contract</strong></td>
              <td class="right dim">${fmt(Q.bcRaw)}</td>
              <td class="right dim">${commPctDisplay}</td>
              <td class="right gld">${fmt(Q.bc - Q.bcRaw)}</td>
              <td class="right mono">${fmt(Q.bc)}</td>
            </tr>
            ${featureRows}
          </tbody>
        </table>

        <div class="tbl-foot">
          <div class="tbl-foot-row">
            <span class="tbl-foot-lbl">Total Without Commission</span>
            <span class="tbl-foot-amt">${fmt(Q.totalNoMod)}</span>
          </div>
          <div class="tbl-foot-row">
            <span class="tbl-foot-lbl">Commission Revenue</span>
            <span class="tbl-foot-amt gld">${fmt(Q.delta)}</span>
          </div>
          <div class="tbl-foot-row" style="border-top:1px solid #3a2e1a;padding-top:12px;margin-top:4px">
            <span class="tbl-foot-lbl">Total Client Price</span>
            <span class="tbl-foot-amt acc">${fmt(Q.total)}</span>
          </div>
          ${hasMonthly ? `
          <div class="tbl-foot-row" style="border-top:1px solid #3a2e1a;padding-top:12px;margin-top:4px">
            <span class="tbl-foot-lbl">Monthly Retainer (client)</span>
            <span class="tbl-foot-amt grn">${fmt(Q.mo)}<span style="font-size:14px;color:#7a7267">/mo</span></span>
          </div>` : ""}
        </div>
      </div>

      <!-- Right: Pricing config snapshot -->
      <div>
        <div class="panel">
          <div class="panel-lbl">Pricing Snapshot</div>
          <div class="meta-row">
            <div class="meta-row-lbl">Handoff Base</div>
            <div class="meta-row-val">${fmt(pricingSnapshot.handoff.base)}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Handoff T1 / T2 / T3</div>
            <div class="meta-row-val">${fmt(pricingSnapshot.handoff.tier1)} / ${fmt(pricingSnapshot.handoff.tier2)} / ${fmt(pricingSnapshot.handoff.tier3)}</div>
          </div>
          ${ct === "hosted" ? `
          <div class="meta-row">
            <div class="meta-row-lbl">Hosted Base</div>
            <div class="meta-row-val">${fmt(pricingSnapshot.hosted.base)}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Hosted T1 / T2 / T3</div>
            <div class="meta-row-val">${fmt(pricingSnapshot.hosted.tier1)} / ${fmt(pricingSnapshot.hosted.tier2)} / ${fmt(pricingSnapshot.hosted.tier3)}</div>
          </div>
          <div class="meta-row">
            <div class="meta-row-lbl">Mo Base / T1 / T2 / T3</div>
            <div class="meta-row-val">${fmt(pricingSnapshot.hosted.moBase)} / ${fmt(pricingSnapshot.hosted.mo1)} / ${fmt(pricingSnapshot.hosted.mo2)} / ${fmt(pricingSnapshot.hosted.mo3)}</div>
          </div>` : ""}
          <div class="meta-row">
            <div class="meta-row-lbl">Base Commission</div>
            <div class="meta-row-val acc">${pricingSnapshot.baseCommission}%</div>
          </div>
        </div>

        <div class="panel" style="margin-top:16px">
          <div class="panel-lbl">Feature Modifiers</div>
          ${sel.map((fid) => {
            const f = featureMap[fid];
            const mod = Q.modPct(fid);
            const modDisplay = mod >= 0 ? `+${(mod * 100).toFixed(0)}%` : `${(mod * 100).toFixed(0)}%`;
            return `<div class="meta-row">
              <div class="meta-row-lbl">${f?.name ?? fid}</div>
              <div class="meta-row-val gld">${modDisplay}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>

    <footer class="foot">
      <div>⚠ Internal document · Do not distribute · Generated by QuoteGoat</div>
      <div>Jakomu Incorporated · ${info.date} · This link is permanent and does not expire.</div>
    </footer>
  </div>
</div>
</body></html>`;
}
