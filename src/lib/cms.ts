/**
 * The only module that reads content. Swap these functions for Payload CMS
 * queries when the CMS goes in (WEB-03); pages do not change.
 */
import { companies, companyOrder } from "@/content/companies";
import { accreditations, policies } from "@/content/policies";
import { sectors } from "@/content/sectors";
import { services } from "@/content/services";
import { domains, groupLegalEntity } from "@/content/settings";
import type { CompanyId, LegalEntity, Vacancy, VacancyRoute } from "@/content/types";
import { vacancies } from "@/content/vacancies";

export const showDrafts = () => process.env.SHOW_DRAFTS === "1" || process.env.SHOW_DRAFTS === "true";

export function getCompanies() {
  return companyOrder.map((id) => companies[id]);
}

export function getCompany(id: Exclude<CompanyId, "group">) {
  return companies[id];
}

export function getLegalEntity(company: CompanyId = "group"): LegalEntity {
  if (company !== "group") return companies[company].legalEntity ?? groupLegalEntity;
  return groupLegalEntity;
}

export function getSectors() {
  return sectors;
}

export function getServices(company?: Exclude<CompanyId, "group">) {
  return company ? services.filter((s) => s.company === company || s.alsoBy?.includes(company)) : services;
}

/** End of the closing day, UK time (vacancy hides after this instant). */
export function closingInstant(closingDate: string): Date {
  // 23:59:59 Europe/London. Use noon UTC to find the offset for that date.
  const noon = new Date(`${closingDate}T12:00:00Z`);
  const londonHour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }).format(noon),
  );
  const offsetHours = londonHour - 12; // 0 in GMT, 1 in BST
  return new Date(Date.parse(`${closingDate}T23:59:59Z`) - offsetHours * 3600_000);
}

export function isVacancyOpen(v: Vacancy, now = new Date(), drafts = showDrafts()): boolean {
  if (v.status !== "published" && !drafts) return false;
  return now.getTime() <= closingInstant(v.closingDate).getTime();
}

export function getOpenVacancies(now = new Date(), drafts = showDrafts()) {
  return vacancies
    .filter((v) => isVacancyOpen(v, now, drafts))
    .sort((a, b) => a.closingDate.localeCompare(b.closingDate));
}

export function getVacancy(slug: string, now = new Date()) {
  const v = vacancies.find((x) => x.slug === slug);
  return v && isVacancyOpen(v, now) ? v : undefined;
}

export const routeLabels: Record<VacancyRoute, string> = {
  graduate: "Graduate Academy",
  apprentice: "Apprenticeship",
  trainee: "Trainee",
  experienced: "Experienced",
};

export function getPolicies(company: CompanyId = "group") {
  return policies.filter((p) => p.company === company || p.company === "group");
}

/** Expired accreditations hide automatically. */
export function getAccreditations(now = new Date()) {
  return accreditations.filter(
    (a) => a.status === "in-progress" || !a.expiryDate || new Date(`${a.expiryDate}T23:59:59Z`) >= now,
  );
}

export function siteUrl() {
  const fallback = process.env.NODE_ENV === "production" ? `https://${domains.canonical}` : "http://localhost:3000";
  return (process.env.SITE_URL || fallback).replace(/\/$/, "");
}
