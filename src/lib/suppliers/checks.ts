import { docTypeLabels } from "./catalogue";
import { checkMinimums, gbp } from "./minimums";
import type { AutomaticCheck, SupplierDoc, SupplierRecord } from "./model";
import { daysUntil, skipsHealthAndSafety } from "./rules";
import { computeOrderGates } from "./tickets";

/** Document types a supplier must hold, given their answers. */
export function requiredDocTypes(r: Pick<SupplierRecord, "work" | "accreditations" | "policies">, now = new Date()): string[] {
  const req = ["el", "pl"];
  if (r.work.capabilities.includes("design") || r.work.categories.includes("consultants")) req.push("pi");
  const skip = skipsHealthAndSafety(r.accreditations, now);
  if (skip.skip) req.push(r.accreditations.ssipSchemes?.length ? "ssip-cert" : "constructionline-cert");
  else req.push("hs-policy");
  return req;
}

export const activeDocs = (docs: SupplierDoc[]) => docs.filter((d) => !d.superseded);

export function missingDocs(r: Pick<SupplierRecord, "work" | "accreditations" | "policies" | "documents">, now = new Date()) {
  const have = new Set(activeDocs(r.documents).map((d) => d.type));
  return requiredDocTypes(r, now).filter((t) => !have.has(t)).map((t) => ({ type: t, label: docTypeLabels[t] ?? t }));
}

/** Automatic checks at submission (section 5b workflow, "Automatic checks"). */
export function automaticChecks(r: Omit<SupplierRecord, "checks" | "status" | "suspended" | "prequalificationTask" | "remindersSent" | "submittedAt" | "declaration">, chStatus: string | null, now = new Date()): AutomaticCheck[] {
  const checks: AutomaticCheck[] = [];
  checks.push(
    chStatus === "not-applicable"
      ? { check: "Companies House status", result: "not-checked", detail: "Sole trader or partnership: no company number. Coordinator to confirm identity, UTR and CIS status by phone" }
      : chStatus === null
      ? { check: "Companies House status", result: "not-checked", detail: "Lookup unavailable; coordinator to check manually" }
      : { check: "Companies House status", result: chStatus === "active" ? "pass" : "fail", detail: `Status: ${chStatus}` },
  );
  const missing = missingDocs(r, now);
  checks.push({
    check: "Documents present",
    result: missing.length ? "fail" : "pass",
    detail: missing.length ? `Missing: ${missing.map((m) => m.label).join(", ")}` : "All required documents uploaded",
  });
  const expired = activeDocs(r.documents).filter((d) => d.expiry && daysUntil(d.expiry, now) < 0);
  checks.push({
    check: "Expiry dates in the future",
    result: expired.length ? "fail" : "pass",
    detail: expired.length ? `Expired: ${expired.map((d) => d.label).join(", ")}` : "No expired documents",
  });
  const mins = checkMinimums(r.insurance, {
    powerOrHighway: r.work.capabilities.includes("power-highway") || r.work.categories.includes("power"),
    designer: r.work.capabilities.includes("design") || r.work.categories.includes("consultants"),
  });
  for (const m of mins) {
    checks.push({
      check: `${m.label} limit`,
      result: m.ok ? "pass" : "fail",
      detail: `${m.actual ? gbp(m.actual) : "Not given"} against a minimum of ${gbp(m.required)}`,
    });
  }
  const waste = r.accreditations.tickets?.["waste-carrier"];
  if (waste?.number) {
    checks.push({
      check: "Waste carrier register",
      result: waste.register?.result ?? "not-checked",
      detail: waste.register?.detail ?? "Not checked; coordinator to check the Environment Agency register",
    });
  }
  for (const g of computeOrderGates(r, now)) {
    checks.push({
      check: `Order gate: ${g.label}`,
      result: g.eligible ? "pass" : "fail",
      detail: g.eligible
        ? "Live tickets held: can receive orders for this work"
        : `Blocked from orders for this work: ${g.blockedBy.map((b) => `${b.label} (${b.detail})`).join("; ")}`,
    });
  }
  return checks;
}
