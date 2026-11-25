import type { Accreditation, PolicyDocument } from "./types";

/**
 * Policy documents (CMS "policy document" type). Phase 1 lists the documents
 * suppliers and buyers will ask for. A document shows a download only when its
 * PDF exists and status is "published"; otherwise it is labelled "in preparation".
 */
export const policies: PolicyDocument[] = [
  { slug: "supplier-code", title: "Supplier code of conduct", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "modern-slavery", title: "Modern slavery statement", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "health-and-safety", title: "Health and safety policy", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "anti-bribery", title: "Anti-bribery and corruption policy", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "fair-payment", title: "Fair payment charter (30-day terms)", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "environmental", title: "Environmental policy", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "quality", title: "Quality policy", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
  { slug: "equality", title: "Equality, diversity and inclusion policy", company: "group", version: "", approvedDate: "", reviewDate: "", status: "in-preparation" },
];

/**
 * Accreditations (CMS "accreditation" type). Listed only once a certificate is
 * held, with its expiry date; anything in progress is labelled "in progress"
 * (honesty rules, section 3). Empty until certificates are held.
 */
export const accreditations: Accreditation[] = [];
