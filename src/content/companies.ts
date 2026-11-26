import type { Company, TradingCompanyId } from "./types";

export const companies: Record<TradingCompanyId, Company> = {
  consultancy: {
    id: "consultancy",
    name: "Nseya Consultancy",
    shortName: "Consultancy",
    path: "/consultancy",
    summary: "Land appraisal, planning from pre-planning and grid connections, then project management, cost, controls and BIM through to handover.",
    tagline: "Know the cost, the risk and the route before you commit.",
    cardCta: "Explore Consultancy",
    accent: "teal",
    mark: "N",
  },
  etablix: {
    id: "etablix",
    name: "ETABLIX",
    shortName: "ETABLIX",
    path: "/etablix",
    summary: "Site services and workforce villages, planned to removal.",
    tagline: "One contractor for everything that keeps a site running.",
    cardCta: "Visit etablix.com",
    accent: "amber",
    mark: "E",
    externalSite: { url: "https://etablix.com", label: "Visit etablix.com" },
  },
  construction: {
    id: "construction",
    name: "Nseya Construction",
    shortName: "Construction",
    path: "/construction",
    summary: "From pre-planning and grid connection to handover: buildings and power infrastructure, civils, M&E and HVAC.",
    tagline: "Built on programme. Proven every week.",
    cardCta: "Explore Construction",
    accent: "cobalt",
    mark: "N",
  },
};

export const companyOrder: TradingCompanyId[] = ["consultancy", "etablix", "construction"];
