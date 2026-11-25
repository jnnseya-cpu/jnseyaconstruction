import { statusLabels } from "./catalogue";
import type { SupplierRecord } from "./model";
import { toCsv } from "./rules";

/**
 * CONSTRUX supplier export (section 6 integrations: daily CSV until the
 * CONSTRUX supplier API is ready). Contains no bank data.
 */
export const construxHeaders = [
  "reference", "status", "suspended", "legal_name", "company_number", "companies_house_status", "vat_number",
  "contact_name", "contact_email", "contact_phone", "regions", "categories", "trades", "capabilities", "typical_job_size",
  "ssip_schemes", "ssip_expiry", "constructionline", "constructionline_expiry", "iso", "other_accreditations", "cis_status",
  "el_limit", "el_expiry", "pl_limit", "pl_expiry", "pi_limit", "pi_expiry", "cw_limit", "cw_expiry",
  "checks_failed", "submitted_at",
];

export function construxCsv(rows: { ref: string | null; data: SupplierRecord }[]): string {
  return toCsv(
    construxHeaders,
    rows.map(({ ref, data: r }) => [
      ref, statusLabels[r.status] ?? r.status, r.suspended ? "yes" : "no", r.company.legalName, r.company.companyNumber,
      r.company.companiesHouseStatus ?? "", r.company.vatNumber ?? "", r.company.contactName, r.email, r.company.phone,
      r.company.regions, r.work.categories, [...r.work.trades, ...(r.work.otherTrades ? [r.work.otherTrades] : [])], r.work.capabilities, r.work.jobSize,
      r.accreditations.ssipSchemes ?? [], r.accreditations.ssipExpiry ?? "", r.accreditations.constructionline ?? "", r.accreditations.constructionlineExpiry ?? "",
      r.accreditations.iso, r.accreditations.other, r.policies.cis,
      r.insurance.el?.limit ?? "", r.insurance.el?.expiry ?? "", r.insurance.pl?.limit ?? "", r.insurance.pl?.expiry ?? "",
      r.insurance.pi?.limit ?? "", r.insurance.pi?.expiry ?? "", r.insurance.cw?.limit ?? "", r.insurance.cw?.expiry ?? "",
      r.checks.filter((c) => c.result === "fail").map((c) => c.check), r.submittedAt,
    ]),
  );
}
