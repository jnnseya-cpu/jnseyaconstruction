/** Options shared by the enquiry forms (FM-01, FM-02). Kept out of the "use server" module, which may export only async functions. */
export const companyOptions = ["consultancy", "etablix", "construction", "not-sure"] as const;
export const enquiryTypes = ["project", "land", "review", "iso19650", "price", "power", "tender", "framework", "quote", "partnership", "other"] as const;
export const enquiryTypeLabels: Record<(typeof enquiryTypes)[number], string> = {
  project: "A project I want to discuss",
  land: "Land: appraisal, acquisition or planning",
  review: "A free 30-minute project review",
  iso19650: "An ISO 19650 readiness check",
  price: "A price from my drawings",
  power: "A power or grid project",
  tender: "A tender or quotation request",
  framework: "A framework or dynamic purchasing system",
  quote: "A quote for home building work",
  partnership: "Partnership or joint venture",
  other: "Something else",
};
export const budgetBands = ["under-50k", "50k-250k", "250k-1m", "1m-5m", "over-5m", "unknown"] as const;
