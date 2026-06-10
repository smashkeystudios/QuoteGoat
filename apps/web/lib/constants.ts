import type { Tier, PricingConfig, Template } from "./types";

export const TIERS: Tier[] = [
  {
    id: 1,
    label: "Tier I",
    cls: "",
    tooltip: "Foundational features — standard complexity.",
    features: [
      { id: "f1",  name: "Basic Analytics Dashboard",  tip: "Custom KPI dashboard with chart views and metric tracking.", tierId: 1, sortOrder: 1 },
      { id: "f2",  name: "User Auth & Auth Flows",      tip: "Login, register, reset, session management.", tierId: 1, sortOrder: 2 },
      { id: "f3",  name: "Email Notification System",   tip: "Transactional email triggers, templates, delivery tracking.", tierId: 1, sortOrder: 3 },
      { id: "f4",  name: "UI Component Library",        tip: "Reusable, branded component set built to spec.", tierId: 1, sortOrder: 4 },
      { id: "f5",  name: "Basic API Integration",       tip: "Connect to a single third-party API with standard endpoints.", tierId: 1, sortOrder: 5 },
    ],
  },
  {
    id: 2,
    label: "Tier II",
    cls: "t2",
    tooltip: "Intermediate features — moderate complexity.",
    features: [
      { id: "f6",  name: "Advanced Data Visualisation", tip: "Interactive charts, filtered views, exportable reports.", tierId: 2, sortOrder: 1 },
      { id: "f7",  name: "Multi-role Permissions",      tip: "Granular role-based access control across the platform.", tierId: 2, sortOrder: 2 },
      { id: "f8",  name: "Real-time Collaboration",     tip: "Live state, shared cursors, conflict resolution logic.", tierId: 2, sortOrder: 3 },
      { id: "f9",  name: "CRM Integration",             tip: "Bi-directional sync with Salesforce, HubSpot, or Pipedrive.", tierId: 2, sortOrder: 4 },
      { id: "f10", name: "Workflow Automation",         tip: "Trigger-action pipelines with conditional branching logic.", tierId: 2, sortOrder: 5 },
    ],
  },
  {
    id: 3,
    label: "Tier III",
    cls: "t3",
    tooltip: "Enterprise-grade features — specialised build time.",
    features: [
      { id: "f11", name: "AI / ML Model Integration",   tip: "LLM or prediction model embedded into your product.", tierId: 3, sortOrder: 1 },
      { id: "f12", name: "Multi-tenant Architecture",   tip: "Isolated tenants, custom domains, per-tenant config.", tierId: 3, sortOrder: 2 },
      { id: "f13", name: "Enterprise SSO & Compliance", tip: "SAML/OIDC SSO, audit logs, GDPR/SOC2 readiness.", tierId: 3, sortOrder: 3 },
      { id: "f14", name: "Custom Mobile Application",   tip: "React Native app for iOS & Android, shared codebase.", tierId: 3, sortOrder: 4 },
      { id: "f15", name: "Dedicated Infra & DevOps",    tip: "CI/CD pipelines, IaC, monitoring, alerting, runbooks.", tierId: 3, sortOrder: 5 },
    ],
  },
];

const ALL_FEAT_IDS = TIERS.flatMap((t) => t.features.map((f) => f.id));

export const DEF_PRICING: PricingConfig = {
  id: 1,
  handoff: { base: 2500, tier1: 800,  tier2: 1800, tier3: 3500 },
  hosted:  { base: 1800, tier1: 900,  tier2: 2200, tier3: 4200, moBase: 500, mo1: 120, mo2: 250, mo3: 450 },
  mods: Object.fromEntries(ALL_FEAT_IDS.map((id) => [id, 30])),
  baseCommission: 0,
};

export const PRESET_TEMPLATES: Template[] = [
  {
    id: "p1",
    name: "Starter Web App",
    desc: "Clean foundation: auth, notifications, basic analytics and a UI kit. Great for MVPs.",
    ct: "handoff", cx: 1, trf: 1,
    features: ["f1", "f2", "f3", "f4"],
    baseCommission: 0,
    isPreset: true,
  },
  {
    id: "p2",
    name: "Growth Platform",
    desc: "Scales up with advanced data viz, CRM sync, multi-role permissions and workflow automation.",
    ct: "handoff", cx: 2, trf: 1,
    features: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f9", "f10"],
    baseCommission: 0,
    isPreset: true,
  },
  {
    id: "p3",
    name: "Managed SaaS",
    desc: "Hosted service with real-time features, collaboration, CRM and ongoing infrastructure retainer.",
    ct: "hosted", cx: 3, trf: 2,
    features: ["f2", "f3", "f4", "f6", "f7", "f8", "f9", "f10"],
    baseCommission: 0,
    isPreset: true,
  },
  {
    id: "p4",
    name: "Enterprise Build",
    desc: "Full-stack enterprise: SSO, multi-tenancy, AI integration, custom mobile app and dedicated DevOps.",
    ct: "handoff", cx: 5, trf: 1,
    features: ["f2", "f3", "f4", "f5", "f6", "f7", "f9", "f11", "f12", "f13", "f14", "f15"],
    baseCommission: 20,
    isPreset: true,
  },
  {
    id: "p5",
    name: "Hosted Enterprise",
    desc: "Enterprise hosted: SSO, multi-tenant architecture, AI, mobile and full managed infrastructure.",
    ct: "hosted", cx: 5, trf: 4,
    features: ["f2", "f3", "f4", "f6", "f7", "f8", "f9", "f11", "f12", "f13", "f14", "f15"],
    baseCommission: 15,
    isPreset: true,
  },
  {
    id: "p6",
    name: "Base Contract Only",
    desc: "No tier features — base contract with commission applied. Good for bespoke scopes.",
    ct: "handoff", cx: 1, trf: 1,
    features: [],
    baseCommission: 30,
    isPreset: true,
  },
];
