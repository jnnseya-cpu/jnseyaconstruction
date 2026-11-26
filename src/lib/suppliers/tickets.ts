/**
 * The five tickets the portal checks before any order (spec section 5b,
 * "Five tickets the portal checks"; diagram "No live ticket, no order").
 *
 * Pure rules, shared by the application form, the server actions, the
 * supplier account, the CONSTRUX export and the daily job. Unit-tested in
 * tests/suppliers.test.ts.
 *
 * A supplier with a missing or expired ticket can still register, but cannot
 * receive an order for the work that needs it. Which work a supplier does is
 * taken from their step-2 answers (categories, trades and capabilities).
 */
import { daysUntil } from "./rules";

export type TicketId = "constructionline" | "cyber-essentials" | "waste-carrier" | "shea-power" | "nsi30";

/** Result of the live Environment Agency register check (waste carrier only). */
export interface RegisterCheck {
  result: "pass" | "fail" | "not-checked";
  detail: string;
  checkedAt: string;
  /** "upper" (CBDU, renewed every 3 years) or "lower" (CBDL, does not expire). */
  tier?: "upper" | "lower";
  /** Expiry date shown on the register, when it gives one. */
  registerExpiry?: string;
}

export interface TicketAnswer {
  /** Certificate, registration or card number(s). */
  number?: string;
  /** For SHEA Power and NSI 30 held by several operatives: the earliest expiry. */
  expiry?: string;
  register?: RegisterCheck;
}

export type TicketAnswers = Partial<Record<TicketId, TicketAnswer>>;

export interface TicketDef {
  id: TicketId;
  label: string;
  short: string;
  /** Supplier document type holding the upload. */
  docType: string;
  numberLabel: string;
  numberHint: string;
  expiryHint: string;
  /** What the supplier must upload to hold (or unblock) this ticket. */
  toUnblock: string;
}

export const tickets: readonly TicketDef[] = [
  {
    id: "constructionline",
    label: "Constructionline Gold",
    short: "Constructionline",
    docType: "constructionline-cert",
    numberLabel: "Constructionline membership number",
    numberHint: "Gold or above preferred",
    expiryHint: "The renewal date on your certificate",
    toUnblock: "your current Constructionline certificate (Gold or above), its membership number and expiry date",
  },
  {
    id: "cyber-essentials",
    label: "Cyber Essentials",
    short: "Cyber Essentials",
    docType: "cyber-essentials-cert",
    numberLabel: "Cyber Essentials certificate number",
    numberHint: "As shown on your certificate (Cyber Essentials or Cyber Essentials Plus)",
    expiryHint: "Certificates last 12 months",
    toUnblock: "your current Cyber Essentials certificate, its number and expiry date",
  },
  {
    id: "waste-carrier",
    label: "Waste carrier registration",
    short: "Waste carrier",
    docType: "waste-carrier-cert",
    numberLabel: "Waste carrier registration number",
    numberHint: "Starts CBDU (upper tier) or CBDL (lower tier), like CBDU123456. We check it on the Environment Agency public register.",
    expiryHint: "Upper-tier (CBDU) registrations last 3 years. Lower-tier (CBDL) registrations do not expire: leave blank.",
    toUnblock: "your waste carrier registration certificate, with a CBDU or CBDL number that is live on the Environment Agency register",
  },
  {
    id: "shea-power",
    label: "EUSR SHEA Power",
    short: "SHEA Power",
    docType: "shea-power-cards",
    numberLabel: "EUSR registration numbers",
    numberHint: "One for every operative you would put on a power site, separated by commas",
    expiryHint: "If your operatives' cards expire on different dates, give the earliest",
    toUnblock: "the EUSR SHEA Power cards (or EUSR register printout) for every operative on a power site, with their registration numbers and the earliest expiry date",
  },
  {
    id: "nsi30",
    label: "National Grid NSI 30 authorisations",
    short: "NSI 30",
    docType: "nsi30-auth",
    numberLabel: "NSI 30 authorisation numbers",
    numberHint: "One for every person who would work inside a National Grid substation, separated by commas",
    expiryHint: "If authorisations expire on different dates, give the earliest",
    toUnblock: "the National Grid NSI 30 authorisation for everyone who would work inside a National Grid substation, with their numbers and the earliest expiry date",
  },
];

export const ticketById = (id: TicketId) => tickets.find((t) => t.id === id)!;
export const ticketDocTypes = tickets.map((t) => t.docType);
/** Document types that are tickets only (not general prequalification evidence). */
export const ticketOnlyDocTypes = ticketDocTypes.filter((t) => t !== "constructionline-cert");
export const ticketForDocType = (docType: string) => tickets.find((t) => t.docType === docType);

/* ---------- Work types gated by tickets ---------- */

export type GatedWorkId = "power-site" | "ng-substation" | "waste-removal";

export interface GatedWork {
  id: GatedWorkId;
  label: string;
  needs: TicketId[];
}

/**
 * Work that cannot be ordered without a live ticket (section 5b): SHEA Power
 * for every operative on a power site, NSI 30 for any work inside a National
 * Grid substation (also a power site), and a waste carrier registration for
 * anyone who removes waste.
 *
 * TO CONFIRM (Justin): Constructionline Gold and Cyber Essentials are
 * recorded, checked and reminded on expiry, but do not gate any work type
 * ("Gold preferred"). Add them to `needs` here if they should.
 */
export const gatedWork: readonly GatedWork[] = [
  { id: "power-site", label: "Power-site work", needs: ["shea-power"] },
  { id: "ng-substation", label: "Work inside National Grid substations", needs: ["nsi30", "shea-power"] },
  { id: "waste-removal", label: "Removing waste from site", needs: ["waste-carrier"] },
];

export interface WorkAnswers {
  categories: string[];
  trades: string[];
  capabilities: string[];
}

/** Capabilities and trades that put operatives on a power site. */
const powerCapabilities = ["power-highway", "hv", "live-substation", "ng-substation"];
const powerTrades = ["HV jointing", "Earthing", "Cable laying and jointing (33kV and 132kV)", "Substation civils", "Testing and commissioning"];

/** Which gated work types a supplier does, from their step-2 answers. */
export function gatedWorkFor(w: WorkAnswers | undefined): GatedWork[] {
  if (!w) return [];
  const caps = new Set(w.capabilities);
  const out: GatedWork[] = [];
  const power =
    w.categories.includes("power") || powerCapabilities.some((c) => caps.has(c)) || w.trades.some((t) => powerTrades.includes(t));
  for (const g of gatedWork) {
    if (g.id === "power-site" && power) out.push(g);
    if (g.id === "ng-substation" && caps.has("ng-substation")) out.push(g);
    if (g.id === "waste-removal" && caps.has("removes-waste")) out.push(g);
  }
  return out;
}

/** Tickets a supplier needs for the work they do, with the work that needs each. */
export function requiredTickets(w: WorkAnswers | undefined): { ticket: TicketDef; for: string[] }[] {
  const map = new Map<TicketId, string[]>();
  for (const g of gatedWorkFor(w)) for (const t of g.needs) map.set(t, [...(map.get(t) ?? []), g.label]);
  return tickets.filter((t) => map.has(t.id)).map((t) => ({ ticket: t, for: map.get(t.id)! }));
}

/* ---------- Waste carrier numbers ---------- */

/**
 * Environment Agency waste carrier, broker and dealer registrations (England)
 * start CBDU (upper tier) or CBDL (lower tier), followed by digits.
 */
export function normaliseWasteCarrierNumber(input: string): { number: string; tier: "upper" | "lower" } | null {
  const s = input.replace(/[\s-]+/g, "").toUpperCase();
  const m = /^CBD([UL])(\d{1,8})$/.exec(s);
  if (!m) return null;
  return { number: s, tier: m[1] === "U" ? "upper" : "lower" };
}

/* ---------- Ticket status ---------- */

export type TicketState = "valid" | "expiring" | "expired" | "missing" | "not-on-register" | "below-gold";

export interface TicketStatus {
  ticket: TicketDef;
  state: TicketState;
  number?: string;
  expiry?: string;
  days?: number;
  detail: string;
}

interface DocLike {
  type: string;
  expiry?: string;
  superseded?: boolean;
}

export interface TicketHolder {
  accreditations: { constructionline?: string; constructionlineExpiry?: string; constructionlineNumber?: string; tickets?: TicketAnswers };
  documents: DocLike[];
}

export function ticketStatus(r: TicketHolder, id: TicketId, now = new Date()): TicketStatus {
  const ticket = ticketById(id);
  const a: TicketAnswer =
    id === "constructionline"
      ? { number: r.accreditations.constructionlineNumber, expiry: r.accreditations.constructionlineExpiry }
      : r.accreditations.tickets?.[id] ?? {};
  const doc = r.documents.find((d) => d.type === ticket.docType && !d.superseded);
  const expiry = doc?.expiry ?? a.expiry;
  const lowerTierWaste = id === "waste-carrier" && normaliseWasteCarrierNumber(a.number ?? "")?.tier === "lower";
  const base = { ticket, number: a.number, expiry };
  if (!a.number || !doc) {
    return { ...base, state: "missing", detail: !doc && a.number ? "Number given but no document uploaded" : "Not provided" };
  }
  if (id === "constructionline" && !["gold", "platinum"].includes(r.accreditations.constructionline ?? "")) {
    return { ...base, state: "below-gold", detail: `Constructionline ${r.accreditations.constructionline ?? "none"}: Gold or above preferred` };
  }
  if (id === "waste-carrier" && a.register?.result === "fail") {
    return { ...base, state: "not-on-register", detail: a.register.detail };
  }
  if (!expiry) {
    return lowerTierWaste
      ? { ...base, state: "valid", detail: "Lower tier: does not expire" }
      : { ...base, state: "missing", detail: "No expiry date given" };
  }
  const days = daysUntil(expiry, now);
  if (days < 0) return { ...base, days, state: "expired", detail: `Expired on ${expiry}` };
  if (days <= 30) return { ...base, days, state: "expiring", detail: `Expires in ${days} day${days === 1 ? "" : "s"} (${expiry})` };
  return { ...base, days, state: "valid", detail: `Valid until ${expiry}` };
}

export const allTicketStatuses = (r: TicketHolder, now = new Date()) => tickets.map((t) => ticketStatus(r, t.id, now));

/** A ticket counts for orders when it is valid or not yet expired. */
export const ticketIsLive = (s: TicketStatus) => s.state === "valid" || s.state === "expiring";

/* ---------- Order gates ---------- */

export interface OrderGateBlock {
  ticket: TicketId;
  label: string;
  reason: "missing" | "expired" | "not-on-register";
  detail: string;
  /** What to upload to unblock. */
  toUnblock: string;
  docType: string;
}

export interface OrderGate {
  work: GatedWorkId;
  label: string;
  eligible: boolean;
  blockedBy: OrderGateBlock[];
}

/**
 * Per gated work type the supplier does: eligible for orders, or blocked and
 * why. Stored on the supplier record as `orderGates` and refreshed daily.
 */
export function computeOrderGates(r: TicketHolder & { work: WorkAnswers }, now = new Date()): OrderGate[] {
  return gatedWorkFor(r.work).map((g) => {
    const blockedBy: OrderGateBlock[] = [];
    for (const id of g.needs) {
      const s = ticketStatus(r, id, now);
      if (ticketIsLive(s)) continue;
      blockedBy.push({
        ticket: id,
        label: s.ticket.label,
        reason: s.state === "expired" ? "expired" : s.state === "not-on-register" ? "not-on-register" : "missing",
        detail: s.detail,
        toUnblock: s.ticket.toUnblock,
        docType: s.ticket.docType,
      });
    }
    return { work: g.id, label: g.label, eligible: blockedBy.length === 0, blockedBy };
  });
}

/** Gates that were eligible (or absent) before and are blocked now. */
export function newlyBlocked(before: OrderGate[] | undefined, after: OrderGate[]): OrderGate[] {
  const was = new Map((before ?? []).map((g) => [g.work, g.eligible]));
  return after.filter((g) => !g.eligible && was.get(g.work) !== false);
}

export const gateSummary = (gates: OrderGate[]) => ({
  eligible: gates.filter((g) => g.eligible).map((g) => g.label),
  blocked: gates.filter((g) => !g.eligible).map((g) => `${g.label}: ${g.blockedBy.map((b) => `${b.label} ${b.reason.replace(/-/g, " ")}`).join(", ")}`),
});

/**
 * Expired documents that suspend a supplier from all new awards. Ticket-only
 * documents are left out: an expired ticket blocks only the work that needs it.
 */
export function suspendingExpired<T extends DocLike>(docs: T[], now = new Date()): T[] {
  return docs.filter((d) => !d.superseded && d.expiry && !ticketOnlyDocTypes.includes(d.type) && daysUntil(d.expiry, now) < 0);
}
