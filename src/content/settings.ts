import type { LegalEntity } from "./types";

/**
 * Company settings (CMS "company settings" type). The legal-entity footer is
 * read from here on every page: change it in one place (spec section 3).
 */
export const groupLegalEntity: LegalEntity = {
  legalName: "JNN GLOBAL LTD",
  companyNumber: "15405437",
  tradingAs: "Etablix and JNseya Construction and Consultants",
  placeOfRegistration: "Registered in England and Wales",
  registeredOffice: "30 Fairford Road, Kingstanding, Birmingham B44 8DJ",
  icoRegistration: "C2089949",
};

export const office = {
  streetAddress: "30 Fairford Road, Kingstanding",
  locality: "Birmingham",
  postalCode: "B44 8DJ",
  country: "GB",
  mapUrl: "https://www.openstreetmap.org/search?query=30%20Fairford%20Road%2C%20Birmingham%20B44%208DJ",
};

/**
 * Public contact details. TO CONFIRM: phone number (empty values are not
 * rendered). The mailboxes must exist before launch (WEB-13).
 */
/**
 * Domains (spec section 3 and decision D1). The live address is
 * www.nseyagroup.com; the bare nseyagroup.com and the other three domains
 * redirect permanently to it (src/middleware.ts).
 */
export const domains = {
  canonical: "www.nseyagroup.com",
  redirects: ["nseyagroup.com", "nseyagroup.co.uk", "www.nseyagroup.co.uk", "nseya.uk", "www.nseya.uk", "nseyagroupe.com", "www.nseyagroupe.com"],
};

/** Group mailboxes on the group domain (D1). Inbox routing in .env can override each. */
export const mailboxes = {
  /** Main public contact address. */
  contact: "contact@nseyagroup.com",
  careers: "careers@nseyagroup.com",
  suppliers: "suppliers@nseyagroup.com",
  justin: "justin@nseyagroup.com",
};

export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? mailboxes.contact,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  responseTime: "We reply to every enquiry within one working day.",
};

export const leadership = {
  name: "Justin Nseya",
  postNominals: "MCIOB",
  role: "Founder and Chief Executive",
  /**
   * Factual CV only (PG-02). Justin to supply. Each line is shown as written.
   * Project experience listed here is Justin's own, never the companies'.
   */
  cv: [] as string[],
};

export const group = {
  name: "Nseya Group Construction",
  promise: "Three construction companies, one accountable team, from first study to final handover.",
  tradingStart: "2027",
  etablixUrl: "https://etablix.com",
  legacyResidentialUrl: "https://www.jnseya.co.uk",
};
