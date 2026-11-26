/** Pure supply-chain rules (unit-tested in tests/suppliers.test.ts). */

/* ---------- Companies House numbers ---------- */

/**
 * UK company numbers are 8 characters: 8 digits (England and Wales, with
 * leading zeros) or a 2-letter prefix plus 6 digits (SC, NI, OC, SO, NC, R0 …).
 * Short all-digit numbers are padded with leading zeros.
 */
export function normaliseCompanyNumber(input: string): string | null {
  const s = input.replace(/\s+/g, "").toUpperCase();
  if (/^\d{1,8}$/.test(s)) return s.padStart(8, "0");
  if (/^[A-Z]{2}\d{6}$/.test(s)) return s;
  if (/^R0\d{6}$/.test(s)) return s;
  return null;
}

/* ---------- Common Assessment Standard skip rule ---------- */

export interface AccreditationAnswers {
  ssipSchemes?: string[];
  ssipExpiry?: string;
  constructionline?: "none" | "bronze" | "silver" | "gold" | "platinum";
  constructionlineExpiry?: string;
}

const endOfDay = (iso: string) => new Date(`${iso}T23:59:59Z`);

/**
 * An applicant with a valid SSIP certificate, or Constructionline Gold or
 * above, skips the matching health-and-safety questions (Common Assessment
 * Standard). Valid means an expiry date that has not passed.
 */
export function skipsHealthAndSafety(a: AccreditationAnswers, now = new Date()): { skip: boolean; reason?: string } {
  const ssip = (a.ssipSchemes ?? []).filter((s) => s && s !== "none");
  if (ssip.length && a.ssipExpiry && endOfDay(a.ssipExpiry) >= now) return { skip: true, reason: "valid SSIP certificate" };
  if ((a.constructionline === "gold" || a.constructionline === "platinum") && a.constructionlineExpiry && endOfDay(a.constructionlineExpiry) >= now) {
    return { skip: true, reason: `Constructionline ${a.constructionline[0].toUpperCase()}${a.constructionline.slice(1)}` };
  }
  return { skip: false };
}

/* ---------- Expiry reminders (30 and 7 days) ---------- */

export interface ExpiringDoc {
  id: string;
  label: string;
  expiry?: string;
  superseded?: boolean;
}

const DAY = 86_400_000;

/** Whole days from now until the end of the expiry day (negative once expired). */
export function daysUntil(expiry: string, now = new Date()): number {
  return Math.floor((endOfDay(expiry).getTime() - now.getTime()) / DAY);
}

export const reminderKey = (doc: ExpiringDoc, stage: 30 | 7) => `${doc.id}:${doc.expiry}:${stage}`;

/**
 * Reminders due now. Each stage is sent once per document and expiry date
 * (keys in `sent`), so the daily job is idempotent and a renewed document
 * starts afresh. If the 30-day reminder was missed and only 7 days are left,
 * only the 7-day reminder is sent.
 */
export function remindersDue<T extends ExpiringDoc>(docs: T[], sent: string[], now = new Date()): { doc: T; stage: 30 | 7; days: number }[] {
  const out: { doc: T; stage: 30 | 7; days: number }[] = [];
  for (const doc of docs) {
    if (!doc.expiry || doc.superseded) continue;
    const d = daysUntil(doc.expiry, now);
    if (d < 0) continue;
    if (d <= 7) {
      if (!sent.includes(reminderKey(doc, 7))) out.push({ doc, stage: 7, days: d });
    } else if (d <= 30) {
      if (!sent.includes(reminderKey(doc, 30))) out.push({ doc, stage: 30, days: d });
    }
  }
  return out;
}

export function expiredDocs(docs: ExpiringDoc[], now = new Date()) {
  return docs.filter((d) => !d.superseded && d.expiry && daysUntil(d.expiry, now) < 0);
}

export function expiringSoon(docs: ExpiringDoc[], now = new Date(), withinDays = 30) {
  return docs.filter((d) => !d.superseded && d.expiry && daysUntil(d.expiry, now) >= 0 && daysUntil(d.expiry, now) <= withinDays);
}

/* ---------- CSV ---------- */

/** RFC 4180 field escaping; also neutralises spreadsheet formula injection. */
export function csvField(v: unknown): string {
  let s = v === undefined || v === null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
  // Plain signed numbers and phone numbers (+44 121 …) are left as they are.
  if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-][\d\s().]+$/.test(s))) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
}
