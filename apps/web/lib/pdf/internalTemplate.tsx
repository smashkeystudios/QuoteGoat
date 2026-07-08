import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PdfPayload } from "@/lib/types";

const C = {
  paper: "#f5f2ec",
  ink: "#0f0e0c",
  acc: "#c84b2f",
  intRed: "#8b1a1a",
  mut: "#7a7267",
  grn: "#1d5c3a",
  gold: "#b8921a",
  line: "#d4cfc5",
  p2: "#ede8df",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;
const UP  = (s: string) => s.toUpperCase();

const cxLabel = (cx: number) =>
  (["", "Minimal", "Low", "Medium", "High", "Enterprise"] as const)[cx] ?? cx.toString();

const S = StyleSheet.create({
  page:     { backgroundColor: C.paper, fontFamily: "Helvetica", fontSize: 8.5, color: C.ink, paddingBottom: 20, paddingHorizontal: 34 },
  banner:   { backgroundColor: C.intRed, color: "white", paddingVertical: 4, paddingHorizontal: 34, marginHorizontal: -34, fontSize: 6.5, letterSpacing: 1.5, marginBottom: 8 },
  label:    { fontSize: 6.5, letterSpacing: 1.2, color: C.mut },
  redLabel: { fontSize: 6.5, letterSpacing: 1.2, color: C.intRed },
  flex1:    { flex: 1 },
  row:      { flexDirection: "row" },
  line:     { borderBottomWidth: 1, borderBottomColor: C.line },
  boldLine: { borderBottomWidth: 1.5, borderBottomColor: C.ink },
  redTop:   { borderTopWidth: 2, borderTopColor: C.intRed },
  mut:      { color: C.mut },
  gold:     { color: C.gold },
  grn:      { color: C.grn },
  intRed:   { color: C.intRed },
});

function Banner() {
  return <Text style={S.banner}>{"⚠ INTERNAL — NOT FOR CLIENT DISTRIBUTION"}</Text>;
}

function Header({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, contractType: ct } = payload;
  return (
    <View>
      <Banner />
      <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-start" }]}>
        <View>
          <Text style={[S.label, { marginBottom: 4 }]}>INTERNAL SUMMARY · QUOTEGOAT</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 20, lineHeight: 1.05 }}>
            {qi.project || "Project"} <Text style={{ fontFamily: "Times-Italic", color: C.intRed }}>Internal Analysis</Text>
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <Text style={S.label}>{"CLIENT: " + UP(qi.name || "Unknown")}</Text>
          <Text style={S.label}>{"DATE: " + qi.date}</Text>
          <Text style={S.label}>{"CONTRACT: " + UP(ct === "handoff" ? "Handoff" : "Hosted Retainer")}</Text>
        </View>
      </View>
    </View>
  );
}

function ConfigStrip({ payload }: { payload: PdfPayload }) {
  const { contractType: ct, complexity, traffic, computed } = payload;
  const cxMult = (1 + (complexity - 1) * 0.15).toFixed(3);
  const trfMult = (1 + ((traffic ?? 1) - 1) * 0.20).toFixed(3);

  const cells = [
    { label: "COMPLEXITY", val: `${cxMult}×`, sub: `Lvl ${complexity}/5 — ${cxLabel(complexity)}` },
    ...(ct === "hosted" ? [{ label: "TRAFFIC", val: `${trfMult}×`, sub: `Lvl ${traffic}/5` }] : []),
    {
      label: "BASE COMMISSION",
      val: computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "None",
      sub: "Applied to base contract",
      valColor: computed.bcCommPct > 0 ? C.gold : C.mut,
    },
  ];

  return (
    <View style={[S.row, { gap: 6, marginTop: 10 }]}>
      {cells.map((c) => (
        <View key={c.label} style={{ backgroundColor: "#f0ece3", padding: 7, minWidth: 100, flex: 1 }}>
          <Text style={[S.label, { marginBottom: 3 }]}>{c.label}</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 15, color: c.valColor ?? C.ink, lineHeight: 1 }}>{c.val}</Text>
          <Text style={[S.mut, { fontSize: 6.5, marginTop: 2 }]}>{c.sub}</Text>
        </View>
      ))}
    </View>
  );
}

function Breakdown({ payload }: { payload: PdfPayload }) {
  const { computed, featureRows, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;

  // Scale row density down as the feature count grows, so the quote keeps fitting one page.
  const n = featureRows.length;
  const rowPad = n > 22 ? 1.5 : n > 16 ? 2 : n > 10 ? 2.5 : 3;
  const nameFs = n > 22 ? 7 : 8;
  const numFs = n > 22 ? 8.5 : 9.5;
  const finalFs = n > 22 ? 9 : 10;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[S.redLabel, { marginBottom: 4 }]}>COST BREAKDOWN</Text>

      <View style={[S.row, S.boldLine, { paddingBottom: 3 }]}>
        <Text style={[S.flex1, S.label]}>FEATURE</Text>
        <Text style={[S.label, { width: 44, textAlign: "right" }]}>TIER</Text>
        <Text style={[S.label, { width: 52, textAlign: "right" }]}>BASE×CX</Text>
        <Text style={[S.label, { width: 40, textAlign: "right" }]}>COMM.</Text>
        <Text style={[S.label, { width: 52, textAlign: "right" }]}>FINAL</Text>
        {hasMonthly && <Text style={[S.label, { width: 48, textAlign: "right" }]}>MO.</Text>}
      </View>

      <View style={[S.row, { alignItems: "center", backgroundColor: "#f0ece3", paddingVertical: rowPad + 0.5, paddingHorizontal: 3, borderBottomWidth: 1, borderBottomColor: C.line }]}>
        <Text style={[S.flex1, { fontFamily: "Helvetica-Bold", fontSize: nameFs }]}>Base Contract</Text>
        <Text style={[S.mut, { width: 44, fontSize: nameFs - 1, textAlign: "right" }]}>—</Text>
        <Text style={{ width: 52, fontFamily: "Times-Roman", fontSize: numFs, textAlign: "right" }}>{fmt(computed.bcRaw)}</Text>
        <Text style={{ width: 40, fontSize: nameFs - 0.5, textAlign: "right", color: computed.bcCommPct > 0 ? C.gold : C.mut }}>
          {computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "—"}
        </Text>
        <Text style={{ width: 52, fontFamily: "Times-Roman", fontSize: finalFs, color: C.grn, textAlign: "right" }}>{fmt(computed.bc)}</Text>
        {hasMonthly && (
          <Text style={{ width: 48, fontSize: nameFs - 1, color: C.grn, textAlign: "right" }}>
            {computed.moBase ? fmt(computed.moBase) + "/mo" : "—"}
          </Text>
        )}
      </View>

      {featureRows.map((r) => (
        <View key={r.id} style={[S.row, { alignItems: "center", paddingVertical: rowPad, paddingHorizontal: 3, borderBottomWidth: 1, borderBottomColor: C.line }]}>
          <Text style={[S.flex1, { fontSize: nameFs }]}>{r.name}</Text>
          <Text style={[S.mut, { width: 44, fontSize: nameFs - 1, textAlign: "right" }]}>{r.tierLabel}</Text>
          <Text style={{ width: 52, fontFamily: "Times-Roman", fontSize: numFs, textAlign: "right" }}>{fmt(r.basePrice)}</Text>
          <Text style={{ width: 40, fontSize: nameFs - 0.5, textAlign: "right", color: r.commission > 0 ? C.gold : C.mut }}>{pct(r.commission)}</Text>
          <Text style={{ width: 52, fontFamily: "Times-Roman", fontSize: finalFs, color: C.grn, textAlign: "right" }}>{fmt(r.finalPrice)}</Text>
          {hasMonthly && (
            <Text style={{ width: 48, fontSize: nameFs - 1, color: C.grn, textAlign: "right" }}>
              {r.monthlyPrice ? fmt(r.monthlyPrice) + "/mo" : "—"}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function Summary({ payload }: { payload: PdfPayload }) {
  const { computed, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;
  const marginPct = computed.totalNoMod > 0
    ? (((computed.total - computed.totalNoMod) / computed.totalNoMod) * 100).toFixed(1)
    : "0.0";

  const rows = [
    { label: "Total before commission", val: fmt(computed.totalNoMod), valColor: C.ink },
    {
      label: `Commission ${computed.delta >= 0 ? "(markup)" : "(discount)"}`,
      val: `${computed.delta >= 0 ? "+" : ""}${fmt(computed.delta)}`,
      valColor: computed.delta >= 0 ? C.gold : C.acc,
    },
    {
      label: "Effective margin",
      val: `${parseFloat(marginPct) >= 0 ? "+" : ""}${marginPct}%`,
      valColor: parseFloat(marginPct) >= 0 ? C.gold : C.acc,
      bold: true,
    },
  ];

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[S.redLabel, { marginBottom: 4 }]}>FINANCIAL SUMMARY</Text>

      {rows.map((item, i) => (
        <View key={i} style={[S.row, { justifyContent: "space-between", alignItems: "baseline", paddingVertical: 3, borderBottomWidth: i === 2 ? 1.5 : 1, borderBottomColor: i === 2 ? C.ink : C.line }]}>
          <Text style={item.bold ? { fontFamily: "Helvetica-Bold", fontSize: 8 } : { color: "#4a4540", fontSize: 8 }}>{item.label}</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 11, color: item.valColor }}>{item.val}</Text>
        </View>
      ))}

      <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 8, borderBottomWidth: hasMonthly ? 1 : 0, borderBottomColor: C.line }]}>
        <Text style={S.label}>CLIENT INVOICE TOTAL</Text>
        <Text style={{ fontFamily: "Times-Roman", fontSize: 22, color: C.acc, lineHeight: 1 }}>{fmt(computed.total)}</Text>
      </View>

      {hasMonthly && (
        <>
          <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line }]}>
            <Text style={[S.label, { color: C.grn }]}>MONTHLY RETAINER</Text>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 15, color: C.grn, lineHeight: 1 }}>
              {fmt(computed.mo)}<Text style={{ fontSize: 9 }}>/mo</Text>
            </Text>
          </View>

          <View style={[S.row, { justifyContent: "space-between", marginTop: 6 }]}>
            {[1, 3, 5].map((yr) => (
              <View key={yr} style={{ alignItems: "center" }}>
                <Text style={S.label}>{yr}YR LCV</Text>
                <Text style={{ fontFamily: "Times-Roman", fontSize: 11, color: C.grn, marginTop: 2 }}>
                  {fmt(computed.total + computed.mo * 12 * yr)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ marginTop: 10, padding: 6, backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#f0c0c0" }}>
        <Text style={[S.redLabel, { marginBottom: 2 }]}>⚠ CONFIDENTIALITY NOTICE</Text>
        <Text style={{ fontSize: 6.5, color: "#5a3030", lineHeight: 1.4 }}>
          Contains internal pricing, commission structures, and margin analysis. Must not be shared with the client or any third party.
        </Text>
      </View>
    </View>
  );
}

export function InternalPdfDoc({ payload }: { payload: PdfPayload }) {
  return (
    <Document title={`INTERNAL — ${payload.quoteInfo.project || "Quote"}`} author="Jakomu Incorporated">
      <Page size="A4" style={S.page}>
        <View wrap={false}>
          <Header payload={payload} />
          <ConfigStrip payload={payload} />
          <Breakdown payload={payload} />
          <Summary payload={payload} />
        </View>
      </Page>
    </Document>
  );
}
