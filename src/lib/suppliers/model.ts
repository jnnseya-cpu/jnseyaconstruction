import type { StoredFile } from "@/lib/forms/uploads";
import type { InsuranceSet } from "./minimums";
import type { AccreditationAnswers } from "./rules";

/** A document held on a supplier record. Bank details are never stored here. */
export interface SupplierDoc {
  id: string;
  type: string;
  label: string;
  expiry?: string;
  file: StoredFile;
  uploadedAt: string;
  superseded?: boolean;
}

export interface SupplierCompany {
  /** limited | llp | sole-trader | partnership. Older records without it are limited companies. */
  businessType?: string;
  legalName: string;
  /** Empty for sole traders and partnerships. */
  companyNumber: string;
  registeredAddress: string;
  vatNumber?: string;
  yearsTrading: string;
  size: string;
  contactName: string;
  contactRole?: string;
  phone: string;
  regions: string[];
  companiesHouseStatus?: string;
}

export interface SupplierWork {
  categories: string[];
  trades: string[];
  otherTrades?: string;
  jobSize: string;
  capacityPeople?: string;
  capacityPlant?: string;
  capabilities: string[];
}

export interface SupplierAccreditations extends AccreditationAnswers {
  iso: string[];
  other: string[];
  cscs?: string;
}

export interface SupplierPolicies {
  hsMethod?: "upload" | "accreditation";
  modernSlavery: boolean;
  antiBribery: boolean;
  supplierCode: boolean;
  platformRule: boolean;
  cis: string;
}

export interface SupplierDraftData {
  email: string;
  step: number;
  company?: SupplierCompany;
  work?: SupplierWork;
  accreditations?: SupplierAccreditations;
  insurance?: InsuranceSet;
  policies?: SupplierPolicies;
  documents: SupplierDoc[];
}

export interface AutomaticCheck {
  check: string;
  result: "pass" | "fail" | "not-checked";
  detail: string;
}

export type SupplierStatus = "applied" | "approved" | "approved-conditions" | "more-info" | "not-approved";

export interface SupplierRecord {
  email: string;
  company: SupplierCompany;
  work: SupplierWork;
  accreditations: SupplierAccreditations;
  insurance: InsuranceSet;
  policies: SupplierPolicies;
  documents: SupplierDoc[];
  status: SupplierStatus;
  /** Suspended from new awards while any required document has expired. */
  suspended: boolean;
  checks: AutomaticCheck[];
  prequalificationTask: "open" | "done";
  remindersSent: string[];
  submittedAt: string;
  declaration: { truthful: true; consent: true; at: string };
}
