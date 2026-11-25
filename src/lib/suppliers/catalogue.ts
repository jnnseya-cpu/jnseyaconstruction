/** Supplier categories, trades and options (spec section 5b). */

export const categories = [
  {
    id: "trade",
    name: "Trade subcontractors",
    examples: ["Groundworks", "Civils", "Drainage", "Concrete", "Steel and frame", "Roofing", "Envelope", "Finishes", "Joinery", "Scaffolding"],
  },
  {
    id: "me",
    name: "M&E and building services",
    examples: ["Electrical (LV)", "HV jointing", "Earthing", "Mechanical", "HVAC", "Plumbing", "Fire alarm and suppression", "Controls and BMS"],
  },
  {
    id: "power",
    name: "Power and utilities specialists",
    examples: ["Cable laying and jointing (33kV and 132kV)", "HDD and ducting", "Substation civils", "Testing and commissioning", "Street-works teams"],
  },
  {
    id: "materials",
    name: "Materials and product suppliers",
    examples: ["Aggregates", "Concrete supply", "Timber", "M&E equipment", "Cable and ducts", "PPE"],
  },
  {
    id: "plant",
    name: "Plant and equipment hire",
    examples: ["Plant", "Cabins", "Welfare units", "Generators", "Traffic management"],
  },
  {
    id: "consultants",
    name: "Consultants and associates",
    examples: ["QS", "Planners", "Designers", "Fire engineers", "Structural engineers", "MEP engineers", "CDM advisers"],
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const regions = [
  "West Midlands",
  "East Midlands",
  "London",
  "South East",
  "South West",
  "East of England",
  "North West",
  "North East",
  "Yorkshire and the Humber",
  "Wales",
  "Scotland",
  "Northern Ireland",
] as const;

export const capabilities = [
  { id: "live-substation", label: "Work in live substations" },
  { id: "street-works", label: "Street works (NRSWA accredited operatives)" },
  { id: "hv", label: "HV jointing or testing" },
  { id: "power-highway", label: "Power or highway work", hint: "Public liability minimum is £10 million for this work" },
  { id: "design", label: "We carry design responsibility", hint: "Professional indemnity is then required" },
  { id: "confined-spaces", label: "Confined spaces" },
] as const;

export const ssipSchemes = ["CHAS", "SMAS Worksafe", "Acclaim", "SafeContractor", "Constructionline (SSIP)", "Other SSIP member scheme"] as const;
export const isoStandards = ["ISO 9001", "ISO 14001", "ISO 45001"] as const;
export const otherAccreditations = ["NICEIC", "NAPIT", "Gas Safe", "F-gas", "NERS", "Achilles UVDB", "CSCS cards for all operatives"] as const;

/** Legal form. Only companies and LLPs have a Companies House number. */
export const businessTypes = [
  { value: "limited", label: "Limited company", hint: "Registered at Companies House" },
  { value: "llp", label: "Limited liability partnership (LLP)", hint: "Registered at Companies House" },
  { value: "sole-trader", label: "Sole trader", hint: "Self-employed, no company number" },
  { value: "partnership", label: "Partnership", hint: "Ordinary partnership, no company number" },
] as const;
export const registeredBusinessTypes = ["limited", "llp"] as const;
export const businessTypeLabel = (t?: string) => businessTypes.find((b) => b.value === t)?.label ?? "Limited company";
export const isRegisteredBusiness = (t?: string) => !t || (registeredBusinessTypes as readonly string[]).includes(t);

export const companySizes = [
  { value: "sole", label: "Sole trader" },
  { value: "micro", label: "1 to 9 people" },
  { value: "small", label: "10 to 49 people" },
  { value: "medium", label: "50 to 249 people" },
  { value: "large", label: "250 people or more" },
] as const;

export const jobSizes = [
  { value: "under-25k", label: "Under £25,000" },
  { value: "25k-100k", label: "£25,000 to £100,000" },
  { value: "100k-500k", label: "£100,000 to £500,000" },
  { value: "over-500k", label: "Over £500,000" },
] as const;

export const cisStatuses = [
  { value: "gross", label: "Registered for gross payment" },
  { value: "net", label: "Registered for net payment (20%)" },
  { value: "not-registered", label: "Not registered" },
  { value: "not-applicable", label: "Not applicable (supplier or consultant, not a subcontractor)" },
] as const;

export const insuranceTypes = [
  { key: "el", label: "Employer's liability" },
  { key: "pl", label: "Public liability" },
  { key: "pi", label: "Professional indemnity" },
  { key: "cw", label: "Contract works" },
] as const;

export const policyDocTypes = [
  { key: "hs-policy", label: "Health and safety policy" },
  { key: "quality-policy", label: "Quality policy" },
  { key: "env-policy", label: "Environmental policy" },
  { key: "equality-policy", label: "Equality policy" },
] as const;

export const docTypeLabels: Record<string, string> = {
  el: "Employer's liability insurance certificate",
  pl: "Public liability insurance certificate",
  pi: "Professional indemnity insurance certificate",
  cw: "Contract works insurance certificate",
  "ssip-cert": "SSIP certificate",
  "constructionline-cert": "Constructionline certificate",
  "hs-policy": "Health and safety policy",
  "quality-policy": "Quality policy",
  "env-policy": "Environmental policy",
  "equality-policy": "Equality policy",
};

export const statusLabels: Record<string, string> = {
  applied: "Registered, not yet vetted",
  approved: "Approved",
  "approved-conditions": "Approved with conditions",
  "more-info": "More information needed",
  "not-approved": "Not approved",
};
