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
  page:     { backgroundColor: C.paper, fontFamily: "Helvetica", fontSize: 10, color: C.ink, paddingBottom: 40, paddingHorizontal: 51 },
  banner:   { backgroundColor: C.intRed, color: "white", paddingVertical: 6, paddingHorizontal: 51, marginHorizontal: -51, fontSize: 8, letterSpacing: 2, marginBottom: 14 },
  label:    { fontSize: 8, letterSpacing: 1.5, color: C.mut, marginBottom: 5 },
  redLabel: { fontSize: 8, letterSpacing: 1.5, color: C.intRed, marginBottom: 5 },
  flex1:    { flex: 1 },
  row:      { flexDirection: "row" },
  line:     { borderBottomWidth: 1, borderBottomColor: C.line },
  boldLine: { borderBottomWidth: 2, borderBottomColor: C.ink },
  redTop:   { borderTopWidth: 3, borderTopColor: C.intRed },
  mut:      { color: C.mut },
  gold:     { color: C.gold },
  grn:      { color: C.grn },
  intRed:   { color: C.intRed },
});

function Banner() {
  return <Text style={S.banner}>{"⚠ INTERNAL — NOT FOR CLIENT DISTRIBUTION"}</Text>;
}

function IntCover({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, contractType: ct } = payload;
  return (
    <Page size="A4" style={[S.page, { paddingTop: 0 }]}>
      <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
        <View>
          <Banner />
          <Text style={[S.label, { marginBottom: 28 }]}>INTERNAL SUMMARY · QUOTEGOAT</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 40, lineHeight: 1.08, marginBottom: 4 }}>{qi.project || "Project"}</Text>
          <Text style={{ fontFamily: "Times-Italic", fontSize: 40, lineHeight: 1.08, color: C.intRed, marginBottom: 28 }}>Internal Analysis</Text>
          <View style={{ gap: 6 }}>
            <Text style={S.label}>{"CLIENT: " + UP(qi.name || "Unknown")}</Text>
            <Text style={S.label}>{"DATE: " + qi.date}</Text>
            <Text style={S.label}>{"CONTRACT: " + UP(ct === "handoff" ? "Handoff" : "Hosted Retainer")}</Text>
          </View>
        </View>
        <View>
          <View style={[S.redTop, { paddingTop: 14 }]} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 15 }}>Jakomu Incorporated</Text>
              <Text style={[S.label, { marginTop: 2, marginBottom: 0 }]}>INTERNAL USE ONLY</Text>
            </View>
            <Text style={[S.redLabel, { textAlign: "right", marginBottom: 0 }]}>CONFIDENTIAL</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

function ConfigPage({ payload }: { payload: PdfPayload }) {
  const { contractType: ct, complexity, traffic, computed, featureRows } = payload;
  const cxMult = (1 + (complexity - 1) * 0.15).toFixed(3);
  const trfMult = (1 + ((traffic ?? 1) - 1) * 0.20).toFixed(3);

  const cells = [
    { label: "COMPLEXITY", val: `${cxMult}×`, sub: `Level ${complexity}/5 — ${cxLabel(complexity)}` },
    ...(ct === "hosted" ? [{ label: "TRAFFIC", val: `${trfMult}×`, sub: `Level ${traffic}/5` }] : []),
    {
      label: "BASE COMMISSION",
      val: computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "None",
      sub: "Applied to base contract",
      valColor: computed.bcCommPct > 0 ? C.gold : C.mut,
    },
  ];

  return (
    <Page size="A4" style={[S.page, { paddingTop: 0 }]}>
      <Banner />
      <Text style={S.redLabel}>PRICING CONFIGURATION</Text>
      <Text style={{ fontFamily: "Times-Roman", fontSize: 26, marginBottom: 20 }}>Multipliers & Config</Text>

      {/* Metric cells */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        {cells.map((c) => (
          <View key={c.label} style={{ backgroundColor: "#f0ece3", padding: 12, minWidth: 130, flex: 1 }}>
            <Text style={[S.label, { marginBottom: 6 }]}>{c.label}</Text>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 26, color: c.valColor ?? C.ink, lineHeight: 1 }}>{c.val}</Text>
            <Text style={[S.mut, { fontSize: 9, marginTop: 3 }]}>{c.sub}</Text>
          </View>
        ))}
      </View>

      {/* Feature commission table */}
      <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 16 }}>
        <Text style={[S.label, { marginBottom: 10 }]}>FEATURE COMMISSION SUMMARY</Text>
        <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: C.ink, paddingBottom: 6, marginBottom: 2 }}>
          <Text style={[S.flex1, S.label, { marginBottom: 0 }]}>FEATURE</Text>
          <Text style={[S.label, { marginBottom: 0, width: 60, textAlign: "right" }]}>TIER</Text>
          <Text style={[S.label, { marginBottom: 0, width: 60, textAlign: "right" }]}>COMMISSION</Text>
        </View>
        {featureRows.map((r) => (
          <View key={r.id} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 6 }}>
            <Text style={S.flex1}>{r.name}</Text>
            <Text style={[S.mut, { width: 60, fontSize: 9, textAlign: "right" }]}>{r.tierLabel}</Text>
            <Text style={{ width: 60, textAlign: "right", color: r.commission > 0 ? C.gold : C.mut }}>
              {pct(r.commission)}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

function BreakdownPage({ payload }: { payload: PdfPayload }) {
  const { computed, featureRows, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;

  return (
    <Page size="A4" style={[S.page, { paddingTop: 0 }]}>
      <Banner />
      <Text style={S.redLabel}>COST BREAKDOWN</Text>
      <Text style={{ fontFamily: "Times-Roman", fontSize: 26, marginBottom: 18 }}>Full Cost Analysis</Text>

      {/* Table header */}
      <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: C.ink, paddingBottom: 6, marginBottom: 2 }}>
        <Text style={[S.flex1, S.label, { marginBottom: 0 }]}>FEATURE</Text>
        <Text style={[S.label, { marginBottom: 0, width: 54, textAlign: "right" }]}>TIER</Text>
        <Text style={[S.label, { marginBottom: 0, width: 60, textAlign: "right" }]}>BASE ×CX</Text>
        <Text style={[S.label, { marginBottom: 0, width: 48, textAlign: "right" }]}>COMM.</Text>
        <Text style={[S.label, { marginBottom: 0, width: 60, textAlign: "right" }]}>FINAL</Text>
        {hasMonthly && <Text style={[S.label, { marginBottom: 0, width: 52, textAlign: "right" }]}>MONTHLY</Text>}
      </View>

      {/* Base contract */}
      <View style={{ flexDirection: "row", backgroundColor: "#f0ece3", paddingVertical: 9, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Text style={[S.flex1, { fontFamily: "Helvetica-Bold" }]}>Base Contract</Text>
        <Text style={[S.mut, { width: 54, fontSize: 9, textAlign: "right" }]}>—</Text>
        <Text style={{ width: 60, fontFamily: "Times-Roman", fontSize: 13, textAlign: "right" }}>{fmt(computed.bcRaw)}</Text>
        <Text style={{ width: 48, textAlign: "right", color: computed.bcCommPct > 0 ? C.gold : C.mut }}>
          {computed.bcCommPct > 0 ? pct(computed.bcCommPct * 100) : "—"}
        </Text>
        <Text style={{ width: 60, fontFamily: "Times-Roman", fontSize: 14, color: C.grn, textAlign: "right" }}>{fmt(computed.bc)}</Text>
        {hasMonthly && (
          <Text style={{ width: 52, fontSize: 9, color: C.grn, textAlign: "right" }}>
            {computed.moBase ? fmt(computed.moBase) + "/mo" : "—"}
          </Text>
        )}
      </View>

      {/* Feature rows */}
      {featureRows.map((r) => (
        <View key={r.id} style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Text style={S.flex1}>{r.name}</Text>
          <Text style={[S.mut, { width: 54, fontSize: 9, textAlign: "right" }]}>{r.tierLabel}</Text>
          <Text style={{ width: 60, fontFamily: "Times-Roman", fontSize: 13, textAlign: "right" }}>{fmt(r.basePrice)}</Text>
          <Text style={{ width: 48, textAlign: "right", color: r.commission > 0 ? C.gold : C.mut }}>{pct(r.commission)}</Text>
          <Text style={{ width: 60, fontFamily: "Times-Roman", fontSize: 14, color: C.grn, textAlign: "right" }}>{fmt(r.finalPrice)}</Text>
          {hasMonthly && (
            <Text style={{ width: 52, fontSize: 9, color: C.grn, textAlign: "right" }}>
              {r.monthlyPrice ? fmt(r.monthlyPrice) + "/mo" : "—"}
            </Text>
          )}
        </View>
      ))}
    </Page>
  );
}

function SummaryPage({ payload }: { payload: PdfPayload }) {
  const { computed, featureRows, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;
  const marginPct = computed.totalNoMod > 0
    ? (((computed.total - computed.totalNoMod) / computed.totalNoMod) * 100).toFixed(1)
    : "0.0";

  return (
    <Page size="A4" style={[S.page, { paddingTop: 0 }]}>
      <Banner />
      <Text style={S.redLabel}>FINANCIAL SUMMARY</Text>
      <Text style={{ fontFamily: "Times-Roman", fontSize: 26, marginBottom: 20 }}>Margin Analysis</Text>

      {/* Margin table */}
      <View style={{ marginBottom: 20 }}>
        {[
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
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingVertical: 11, borderBottomWidth: i === 2 ? 2 : 1, borderBottomColor: i === 2 ? C.ink : C.line }}>
            <Text style={item.bold ? { fontFamily: "Helvetica-Bold" } : { color: "#4a4540" }}>{item.label}</Text>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 17, color: item.valColor }}>{item.val}</Text>
          </View>
        ))}
      </View>

      {/* Client invoice total */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 14, borderBottomWidth: hasMonthly ? 1 : 0, borderBottomColor: C.line }}>
        <Text style={[S.label, { marginBottom: 0 }]}>CLIENT INVOICE TOTAL</Text>
        <Text style={{ fontFamily: "Times-Roman", fontSize: 48, color: C.acc, lineHeight: 1 }}>{fmt(computed.total)}</Text>
      </View>

      {hasMonthly && (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={[S.label, { color: C.grn, marginBottom: 0 }]}>MONTHLY RETAINER</Text>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 28, color: C.grn, lineHeight: 1 }}>
              {fmt(computed.mo)}<Text style={{ fontSize: 11 }}>/mo</Text>
            </Text>
          </View>

          {/* LCV table */}
          <View style={{ marginTop: 16 }}>
            <Text style={[S.label, { color: C.grn, marginBottom: 10 }]}>LIFETIME CUSTOMER VALUE PROJECTION</Text>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 6, marginBottom: 2 }}>
              <Text style={[S.flex1, S.label, { marginBottom: 0 }]}>PERIOD</Text>
              <Text style={[S.label, { marginBottom: 0, width: 70, textAlign: "right" }]}>RECURRING/YR</Text>
              <Text style={[S.label, { marginBottom: 0, width: 80, textAlign: "right" }]}>CUMULATIVE</Text>
              <Text style={[S.label, { marginBottom: 0, width: 80, textAlign: "right" }]}>TOTAL LCV</Text>
            </View>
            {[1, 2, 3, 4, 5].map((yr) => {
              const recurring = computed.mo * 12 * yr;
              const totalLcv = computed.total + recurring;
              const isLast = yr === 5;
              return (
                <View key={yr} style={{ flexDirection: "row", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: isLast ? "#eef3ef" : "transparent" }}>
                  <Text style={[S.flex1, isLast ? { fontFamily: "Helvetica-Bold" } : {}]}>Year {yr}</Text>
                  <Text style={{ width: 70, textAlign: "right", color: C.grn, fontSize: 10 }}>{fmt(computed.mo * 12)}/yr</Text>
                  <Text style={{ width: 80, textAlign: "right", fontFamily: "Times-Roman", fontSize: isLast ? 14 : 12, color: C.grn }}>{fmt(recurring)}</Text>
                  <Text style={{ width: 80, textAlign: "right", fontFamily: "Times-Roman", fontSize: isLast ? 15 : 12, color: isLast ? C.grn : C.ink }}>{fmt(totalLcv)}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Confidentiality */}
      <View style={{ marginTop: 20, padding: 12, backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#f0c0c0" }}>
        <Text style={[S.redLabel, { marginBottom: 5 }]}>⚠ CONFIDENTIALITY NOTICE</Text>
        <Text style={{ fontSize: 10, color: "#5a3030", lineHeight: 1.7 }}>
          This document contains internal pricing information, commission structures, and margin analysis. It must not be shared with the client or any third party.
        </Text>
      </View>
    </Page>
  );
}

export function InternalPdfDoc({ payload }: { payload: PdfPayload }) {
  return (
    <Document title={`INTERNAL — ${payload.quoteInfo.project || "Quote"}`} author="Jakomu Incorporated">
      <IntCover payload={payload} />
      <ConfigPage payload={payload} />
      <BreakdownPage payload={payload} />
      <SummaryPage payload={payload} />
    </Document>
  );
}
