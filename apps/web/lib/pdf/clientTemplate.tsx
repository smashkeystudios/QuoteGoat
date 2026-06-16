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
  page:       { backgroundColor: C.paper, fontFamily: "Helvetica", fontSize: 10, color: C.ink, paddingTop: 51, paddingBottom: 40, paddingHorizontal: 51 },
  col:        { flexDirection: "column" },
  row:        { flexDirection: "row" },
  flex1:      { flex: 1 },
  bold:       { fontFamily: "Helvetica-Bold" },
  serif:      { fontFamily: "Times-Roman" },
  serifI:     { fontFamily: "Times-Italic" },
  mut:        { color: C.mut },
  acc:        { color: C.acc },
  grn:        { color: C.grn },
  label:      { fontSize: 8, letterSpacing: 1.5, color: C.mut, marginBottom: 5 },
  divLine:    { borderBottomWidth: 1, borderBottomColor: C.line, marginVertical: 10 },
  accLine:    { borderBottomWidth: 3, borderBottomColor: C.acc },
  spacer:     { flex: 1 },
});

function Label({ children }: { children: string }) {
  return <Text style={S.label}>{UP(children)}</Text>;
}

function Cover({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, contractType: ct, complexity } = payload;
  const ctLabel = ct === "handoff" ? "HANDOFF" : "HOSTED RETAINER";
  return (
    <Page size="A4" style={S.page}>
      <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
        <View>
          <Text style={[S.label, { marginBottom: 36 }]}>QUOTEGOAT · POWERED BY JAKOMU INCORPORATED</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 48, lineHeight: 1.08, marginBottom: 8 }}>
            {qi.project || "Project"}
          </Text>
          <Text style={{ fontFamily: "Times-Italic", fontSize: 48, lineHeight: 1.08, color: C.acc, marginBottom: 30 }}>
            Proposal
          </Text>
          <View style={{ marginTop: 4 }}>
            <Text style={[S.label, { marginBottom: 6 }]}>PREPARED FOR</Text>
            <Text style={{ fontSize: 13, marginBottom: 16 }}>{qi.name || "Client"}</Text>
            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <Text style={[{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: C.p2, fontSize: 8, letterSpacing: 1.2 }]}>{UP(ctLabel)}</Text>
              <Text style={[{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: C.p2, fontSize: 8, letterSpacing: 1.2 }]}>COMPLEXITY {complexity}</Text>
              <Text style={[{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: C.p2, fontSize: 8, letterSpacing: 1.2 }]}>{qi.date}</Text>
            </View>
          </View>
        </View>
        <View>
          <View style={[S.accLine, { paddingTop: 14 }]} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 }}>
            <View>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 16 }}>Jakomu Incorporated</Text>
              <Text style={[S.label, { marginTop: 3, marginBottom: 0 }]}>POWERED BY QUOTEGOAT</Text>
            </View>
            <Text style={[S.label, { textAlign: "right", marginBottom: 0 }]}>
              {"PREPARED EXCLUSIVELY FOR\n" + UP(qi.name || "CLIENT")}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

function ScopePage({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, contractType: ct, complexity, featureRows } = payload;
  const ctLabel = ct === "handoff" ? "Handoff" : "Hosted Retainer";
  return (
    <Page size="A4" style={S.page}>
      <Label>Project Scope</Label>
      <Text style={{ fontFamily: "Times-Roman", fontSize: 30, marginBottom: 20 }}>{qi.project || "Project"}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        <Text style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: C.p2, fontSize: 8, letterSpacing: 1.2 }}>{UP(ctLabel)}</Text>
        <Text style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: C.p2, fontSize: 8, letterSpacing: 1.2 }}>COMPLEXITY {complexity}</Text>
      </View>
      <Label>{`Deliverables — ${featureRows.length} Feature${featureRows.length !== 1 ? "s" : ""}`}</Label>
      {featureRows.length === 0 ? (
        <Text style={[S.mut, { fontFamily: "Times-Italic", paddingVertical: 18 }]}>Base contract — no individual features selected.</Text>
      ) : (
        featureRows.map((r) => (
          <View key={r.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={{ width: 56, paddingHorizontal: 4, paddingVertical: 2, backgroundColor: tierBg(r.tier), color: tierColor(r.tier), fontSize: 7, letterSpacing: 0.8, textAlign: "center" }}>
              {UP(r.tierLabel)}
            </Text>
            <View style={S.flex1}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: r.tip ? 2 : 0 }}>{r.name}</Text>
              {r.tip ? <Text style={[S.mut, { fontSize: 9, lineHeight: 1.5 }]}>{r.tip}</Text> : null}
            </View>
          </View>
        ))
      )}
    </Page>
  );
}

function InvestmentPage({ payload }: { payload: PdfPayload }) {
  const { computed, featureRows, contractType: ct } = payload;
  const hasMonthly = ct === "hosted" && computed.mo > 0;

  const byTier: Record<number, typeof featureRows> = {};
  for (const r of featureRows) {
    if (!byTier[r.tier]) byTier[r.tier] = [];
    byTier[r.tier].push(r);
  }

  return (
    <Page size="A4" style={S.page}>
      <Label>Investment</Label>
      <Text style={{ fontFamily: "Times-Roman", fontSize: 30, marginBottom: 24 }}>Project Investment</Text>

      {/* Table header */}
      <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: C.ink, paddingBottom: 6, marginBottom: 4 }}>
        <Text style={[S.flex1, S.label, { marginBottom: 0 }]}>ITEM</Text>
        <Text style={[S.label, { marginBottom: 0, textAlign: "right" }]}>INVESTMENT</Text>
      </View>

      {/* Base contract row */}
      <View style={{ flexDirection: "row", backgroundColor: "#f0ece3", paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Text style={[S.flex1, { fontFamily: "Helvetica-Bold" }]}>Base Contract</Text>
        <Text style={{ fontFamily: "Times-Roman", fontSize: 15 }}>{fmt(computed.bc)}</Text>
      </View>

      {/* Feature rows by tier */}
      {Object.entries(byTier).map(([tierNum, rows]) => {
        const n = Number(tierNum);
        return (
          <View key={tierNum}>
            <View style={{ backgroundColor: tierBg(n), paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Text style={{ fontSize: 7, letterSpacing: 1, color: tierColor(n) }}>{UP(rows[0]?.tierLabel ?? `Tier ${n}`)}</Text>
            </View>
            {rows.map((r) => (
              <View key={r.id} style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={S.flex1}>{r.name}</Text>
                <Text style={{ fontFamily: "Times-Roman", fontSize: 14 }}>{fmt(r.finalPrice)}</Text>
              </View>
            ))}
          </View>
        );
      })}

      {/* Totals */}
      <View style={{ borderTopWidth: 2, borderTopColor: C.ink, paddingTop: 14, marginTop: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Text style={[S.label, { marginBottom: 0 }]}>TOTAL UPFRONT INVESTMENT</Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 46, color: C.acc, lineHeight: 1 }}>{fmt(computed.total)}</Text>
        </View>
        {hasMonthly && (
          <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12, marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={[S.label, { color: C.grn, marginBottom: 0 }]}>MONTHLY RETAINER</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 28, color: C.grn, lineHeight: 1 }}>
                {fmt(computed.mo)}<Text style={{ fontSize: 12 }}>/mo</Text>
              </Text>
            </View>
          </View>
        )}
      </View>
    </Page>
  );
}

function TermsPage({ payload }: { payload: PdfPayload }) {
  const { quoteInfo: qi, validityDays = 30 } = payload;
  const validityDate = new Date(new Date(qi.date).getTime() + validityDays * 86_400_000)
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const sections = [
    ["VALIDITY", `This proposal is valid until ${validityDate} (${validityDays} days from issue). After this date, pricing is subject to revision.`],
    ["SCOPE", "The investment outlined covers the specific features and deliverables described in this proposal. Additional scope will be quoted separately and requires written agreement."],
    ["PAYMENT", "Typical terms include a 50% deposit upon project commencement with the remainder due upon delivery. Final terms outlined in the service agreement."],
    ["REVISIONS", "Two rounds of revisions are included per major deliverable. Additional rounds are available at our standard hourly rate."],
    ["TAXES", "All prices exclude applicable taxes, which will be itemised in final invoices in accordance with applicable law."],
  ] as const;

  return (
    <Page size="A4" style={S.page}>
      <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
        <View>
          <Label>Terms & Conditions</Label>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 30, marginBottom: 24 }}>Proposal Terms</Text>
          {sections.map(([title, body]) => (
            <View key={title} style={{ marginBottom: 18 }}>
              <Text style={[S.label, { color: C.acc, marginBottom: 5 }]}>{title}</Text>
              <Text style={{ color: "#4a4540", lineHeight: 1.7, fontSize: 10 }}>{body}</Text>
            </View>
          ))}
        </View>
        <View>
          <View style={[S.accLine, { marginBottom: 14 }]} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 15 }}>Jakomu Incorporated</Text>
              <Text style={[S.label, { marginTop: 2, marginBottom: 0 }]}>POWERED BY QUOTEGOAT</Text>
            </View>
            <Text style={[S.label, { textAlign: "right", marginBottom: 0 }]}>
              {UP(`Prepared for ${qi.name || "Client"}\n${qi.date}`)}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

export function ClientPdfDoc({ payload }: { payload: PdfPayload }) {
  return (
    <Document title={`${payload.quoteInfo.project || "Quote"} — Proposal`} author="Jakomu Incorporated">
      <Cover payload={payload} />
      <ScopePage payload={payload} />
      <InvestmentPage payload={payload} />
      <TermsPage payload={payload} />
    </Document>
  );
}
