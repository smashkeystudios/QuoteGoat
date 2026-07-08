import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PdfPayload } from "@/lib/types";

const C = {
  paper: "#f5f2ec",
  ink: "#0f0e0c",
  acc: "#c84b2f",
  mut: "#7a7267",
  grn: "#1d5c3a",
  line: "#d4cfc5",
  p2: "#ede8df",
  t1c: "#4a7c59", t1bg: "#eef3ef",
  t2c: "#7a6b3a", t2bg: "#f3f0e8",
  t3c: "#6b3a4a", t3bg: "#f3eaed",
};

const tierColor = (t: number) => [C.t1c, C.t2c, C.t3c][t - 1] ?? C.mut;
const tierBg    = (t: number) => [C.t1bg, C.t2bg, C.t3bg][t - 1] ?? C.p2;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const UP = (s: string) => s.toUpperCase();

const S = StyleSheet.create({
  page:       { backgroundColor: C.paper, fontFamily: "Helvetica", fontSize: 8.5, color: C.ink, paddingTop: 28, paddingBottom: 24, paddingHorizontal: 34 },
  row:        { flexDirection: "row" },
  flex1:      { flex: 1 },
  bold:       { fontFamily: "Helvetica-Bold" },
  mut:        { color: C.mut },
  acc:        { color: C.acc },
  grn:        { color: C.grn },
  label:      { fontSize: 6.5, letterSpacing: 1.2, color: C.mut },
  chip:       { paddingHorizontal: 6, paddingVertical: 3, backgroundColor: C.p2, fontSize: 6.5, letterSpacing: 0.9 },
  divLine:    { borderBottomWidth: 1, borderBottomColor: C.line },
  accLine:    { borderBottomWidth: 2, borderBottomColor: C.acc },
});

function Header({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, contractType: ct, complexity } = payload;
  const ctLabel = ct === "handoff" ? "Handoff" : "Hosted Retainer";
  return (
    <View>
      <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }]}>
        <View>
          <Text style={[S.label, { marginBottom: 5 }]}>QUOTEGOAT · POWERED BY JAKOMU INCORPORATED</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 24, lineHeight: 1.05 }}>
            {qi.project || "Project"} <Text style={{ fontFamily: "Times-Italic", color: C.acc }}>Proposal</Text>
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[S.label, { marginBottom: 3 }]}>PREPARED FOR</Text>
          <Text style={{ fontSize: 11 }}>{qi.name || "Client"}</Text>
        </View>
      </View>
      <View style={[S.row, { gap: 6 }]}>
        <Text style={S.chip}>{UP(ctLabel)}</Text>
        <Text style={S.chip}>COMPLEXITY {complexity}</Text>
        <Text style={S.chip}>{qi.date}</Text>
      </View>
    </View>
  );
}

function Investment({ payload }: { payload: PdfPayload }) {
  const { computed, featureRows, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;

  // Scale row density down as the feature count grows, so the quote keeps fitting one page.
  const n = featureRows.length;
  const rowPad = n > 22 ? 1.5 : n > 16 ? 2.25 : n > 10 ? 3 : 3.5;
  const rowFs = n > 22 ? 7.5 : 8.5;
  const priceFs = n > 22 ? 9 : 10;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[S.label, { marginBottom: 4 }]}>{`DELIVERABLES & INVESTMENT — ${n} FEATURE${n !== 1 ? "S" : ""}`}</Text>

      <View style={[S.row, S.divLine, { borderBottomWidth: 1.5, borderBottomColor: C.ink, paddingBottom: 3 }]}>
        <Text style={[S.label, { width: 46 }]}>TIER</Text>
        <Text style={[S.flex1, S.label]}>ITEM</Text>
        <Text style={S.label}>AMOUNT</Text>
      </View>

      <View style={[S.row, { alignItems: "center", paddingVertical: rowPad + 0.5, borderBottomWidth: 1, borderBottomColor: C.line }]}>
        <Text style={{ width: 46 }} />
        <Text style={[S.flex1, S.bold, { fontSize: rowFs }]}>Base Contract</Text>
        <Text style={{ fontFamily: "Times-Roman", fontSize: priceFs + 1 }}>{fmt(computed.bc)}</Text>
      </View>

      {featureRows.map((r) => (
        <View key={r.id} style={[S.row, { alignItems: "center", paddingVertical: rowPad, borderBottomWidth: 1, borderBottomColor: C.line }]}>
          <Text style={{ width: 40, marginRight: 6, paddingHorizontal: 3, paddingVertical: 1.5, backgroundColor: tierBg(r.tier), color: tierColor(r.tier), fontSize: 5, letterSpacing: 0.4, textAlign: "center" }}>
            {UP(r.tierLabel)}
          </Text>
          <Text style={[S.flex1, { fontSize: rowFs }]}>{r.name}</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: priceFs }}>{fmt(r.finalPrice)}</Text>
        </View>
      ))}

      <View style={{ borderTopWidth: 2, borderTopColor: C.ink, paddingTop: 8, marginTop: 4 }}>
        <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-end" }]}>
          <Text style={S.label}>TOTAL UPFRONT INVESTMENT</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 24, color: C.acc, lineHeight: 1 }}>{fmt(computed.total)}</Text>
        </View>
        {hasMonthly && (
          <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6, marginTop: 6 }]}>
            <Text style={[S.label, { color: C.grn }]}>MONTHLY RETAINER</Text>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 15, color: C.grn, lineHeight: 1 }}>
              {fmt(computed.moFinal)}<Text style={{ fontSize: 9 }}>/mo</Text>
            </Text>
          </View>
        )}
      </View>

      {hasMonthly && (
        <View style={[S.row, { justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: C.line, borderStyle: "dashed" }]}>
          {[1, 3, 5].map((yr) => (
            <View key={yr} style={{ alignItems: "center" }}>
              <Text style={S.label}>{yr}YR LCV</Text>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 11, color: C.grn, marginTop: 2 }}>
                {fmt(computed.total + computed.moFinal * 12 * yr)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Terms({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, validityDays = 30 } = payload;
  const validityDate = new Date(new Date(qi.date).getTime() + validityDays * 86_400_000)
    .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const sections = [
    ["VALIDITY", `Valid until ${validityDate} (${validityDays} days). Pricing subject to revision after.`],
    ["SCOPE", "Covers only the features/deliverables listed above. Additional scope quoted separately."],
    ["PAYMENT", "50% deposit on commencement, remainder on delivery. Full terms in service agreement."],
    ["REVISIONS", "Two rounds of revisions included per major deliverable; additional rounds billed hourly."],
    ["TAXES", "Prices exclude applicable taxes, itemised in final invoices per applicable law."],
  ] as const;

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[S.label, { marginBottom: 5 }]}>TERMS & CONDITIONS</Text>
      {sections.map(([title, body]) => (
        <View key={title} style={[S.row, { gap: 6, paddingVertical: 2.5 }]}>
          <Text style={{ width: 54, fontSize: 6, letterSpacing: 0.8, color: C.acc }}>{title}</Text>
          <Text style={[S.flex1, { fontSize: 7, lineHeight: 1.4, color: "#4a4540" }]}>{body}</Text>
        </View>
      ))}
    </View>
  );
}

function Footer({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi } = payload;
  return (
    <View>
      <View style={[S.accLine, { marginBottom: 6 }]} />
      <View style={[S.row, { justifyContent: "space-between", alignItems: "flex-end" }]}>
        <View>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 11 }}>Jakomu Incorporated</Text>
          <Text style={[S.label, { marginTop: 1 }]}>POWERED BY QUOTEGOAT</Text>
        </View>
        <Text style={[S.label, { textAlign: "right" }]}>
          {"PREPARED EXCLUSIVELY FOR " + UP(qi.name || "CLIENT")}
        </Text>
      </View>
    </View>
  );
}

export function ClientPdfDoc({ payload }: { payload: PdfPayload }) {
  return (
    <Document title={`${payload.quoteInfo.project || "Quote"} — Proposal`} author="Jakomu Incorporated">
      <Page size="A4" style={S.page}>
        <View wrap={false} style={{ flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
          <View>
            <Header payload={payload} />
            <Investment payload={payload} />
            <Terms payload={payload} />
          </View>
          <Footer payload={payload} />
        </View>
      </Page>
    </Document>
  );
}
