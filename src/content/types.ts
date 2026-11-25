/**
 * Content types. These mirror the headless-CMS content types in spec section 8
 * (page, service, sector, vacancy, policy document, accreditation, article,
 * case study, company settings). Phase 1 keeps content as typed files in
 * src/content; src/lib/cms.ts is the only module that reads them, so moving to
 * Payload CMS means re-implementing that one module.
 */

export type CompanyId = "group" | "consultancy" | "etablix" | "construction";
export type TradingCompanyId = Exclude<CompanyId, "group">;

export interface LegalEntity {
  legalName: string;
  companyNumber: string;
  tradingAs?: string;
  placeOfRegistration: string;
  registeredOffice: string;
  icoRegistration?: string;
}

export interface Company {
  id: TradingCompanyId;
  name: string;
  shortName: string;
  path: string;
  /** One-line description used on cards. */
  summary: string;
  /** Copy deck: the company's line ("Know the cost, the risk and the route before you commit."). */
  tagline: string;
  /** Copy deck: the call to action on the home page card. */
  cardCta: string;
  /** Accent token name used by data-company theming. */
  accent: "teal" | "amber" | "cobalt";
  externalSite?: { url: string; label: string };
  /** Mark device: hexagon-N or hexagon-E. */
  mark: "N" | "E";
  /** Path to the capability statement PDF, once produced. */
  capabilityStatement?: string;
  /** Legal entity override once this company is incorporated. */
  legalEntity?: LegalEntity;
}

export type SectorId =
  | "public-estate"
  | "social-housing"
  | "energy-grid"
  | "data-centres"
  | "commercial-mixed-use"
  | "residential";

export interface Sector {
  id: SectorId;
  name: string;
  summary: string;
}

export interface Service {
  slug: string;
  company: TradingCompanyId;
  name: string;
  summary: string;
  sectors: SectorId[];
  /** Phase in which the service's own page (PG-07..18) goes live. */
  pagePhase: "P2" | "P3";
}

export type VacancyRoute = "graduate" | "apprentice" | "trainee" | "experienced";
export type ContractType = "permanent" | "fixed-term" | "apprenticeship" | "part-time";

export interface Vacancy {
  slug: string;
  title: string;
  company: CompanyId;
  /** Employing entity named on the advert (decision D4: JNN Global Ltd until incorporation). */
  employer: string;
  route: VacancyRoute;
  location: string;
  contractType: ContractType;
  salary: { min: number; max: number; period: "YEAR" | "HOUR" };
  hours: string;
  /** ISO date. Vacancy hides automatically after the end of this day (UK time). */
  closingDate: string;
  postedDate: string;
  summary: string;
  whatYouWillDo: string[];
  whatYouGet: string[];
  whatWeLookFor: string[];
  /** Draft vacancies render only when SHOW_DRAFTS is set (staging). */
  status: "draft" | "published";
}

export interface PolicyDocument {
  slug: string;
  title: string;
  company: CompanyId;
  version: string;
  /** ISO dates. */
  approvedDate: string;
  reviewDate: string;
  /** Public path of the PDF, or undefined while the document is being prepared. */
  file?: string;
  status: "published" | "in-preparation";
}

export interface Accreditation {
  name: string;
  scheme: string;
  company: CompanyId;
  certificateNumber?: string;
  /** ISO date; expired accreditations hide automatically. */
  expiryDate?: string;
  status: "held" | "in-progress";
}

export interface Faq {
  q: string;
  a: string;
}
