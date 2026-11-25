import "server-only";
import { inbox, sendEmail, signature } from "./email";
import { logEvent } from "./log";
import { addMonths, store } from "./store";

/**
 * Staff-side careers functions. Deliberately NOT in the "use server" module,
 * so they can never be called from a browser. Use from CMS hooks or
 * authenticated staff tooling only.
 */

export type ApplicationStage = "received" | "shortlisted" | "interview" | "offer" | "unsuccessful";

const stageText: Record<ApplicationStage, string> = {
  received: "We have your application and will review it.",
  shortlisted: "Good news: you are on our shortlist. We will call you soon for a short chat.",
  interview: "We would like to meet you. We will email you the date, time and place. Tell us if you need any adjustments.",
  offer: "We are pleased to offer you the role. We will send the details and next steps separately.",
  unsuccessful:
    "Thank you for your time. This time we will not be taking your application further. We delete your details 6 months after this email unless you join our talent pool.",
};

interface ApplicationRecord {
  name: string;
  email: string;
  phone: string;
  role: string;
  rightToWork: string;
  applyRoute: string;
  vacancySlug?: string;
  degree?: string;
  graduationDate?: string;
  status: ApplicationStage;
  cv?: { name: string; id: string };
}

export async function sendApplicationStatus(ref: string, stage: ApplicationStage): Promise<boolean> {
  const rec = await store().findByRef<ApplicationRecord>("application", ref);
  if (!rec) return false;
  // Unsuccessful: delete 6 months from the outcome. Hired: kept under employment records, not here.
  const expiresAt = stage === "unsuccessful" ? addMonths(new Date(), 6) : undefined;
  await store().update("application", rec.id, { ...rec.data, status: stage }, expiresAt ? { expiresAt } : {});
  await logEvent("application_status", { ref, stage });
  return sendEmail(
    {
      to: rec.data.email,
      subject: `Your application ${ref}: ${stage === "received" ? "received" : "update"}`,
      text: `Dear ${rec.data.name},\n\n${stageText[stage]}\n\nRole: ${rec.data.role}\nReference: ${ref}${signature}`,
      replyTo: inbox.people() || undefined,
    },
    "FM-04 status",
  );
}

const csvCell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Quote, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** CSV export of applications until the CONSTRUX/VERYX people module exists. No equality or referral data. */
export async function applicationsCsv(): Promise<string> {
  const rows = await store().list<ApplicationRecord>("application");
  const cols = ["ref", "received", "status", "role", "vacancySlug", "name", "email", "phone", "rightToWork", "applyRoute", "degree", "graduationDate", "cvFile"] as const;
  const lines = [cols.join(",")];
  for (const r of rows) {
    const d = r.data;
    lines.push(
      [r.ref, r.createdAt, d.status, d.role, d.vacancySlug, d.name, d.email, d.phone, d.rightToWork, d.applyRoute, d.degree, d.graduationDate, d.cv?.name]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}
