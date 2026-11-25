import type { Company, TradingCompanyId } from "./types";

export const companies: Record<TradingCompanyId, Company> = {
  consultancy: {
    id: "consultancy",
    name: "Nseya Consultancy",
    shortName: "Consultancy",
    path: "/consultancy",
    summary: "Project, cost and controls management, feasibility studies and tender support for clients and contractors.",
    accent: "teal",
    mark: "N",
  },
  etablix: {
    id: "etablix",
    name: "ETABLIX",
    shortName: "ETABLIX",
    path: "/etablix",
    summary: "Integrated site services and workforce villages, planned, set up, run and removed by one accountable team.",
    accent: "amber",
    mark: "E",
    externalSite: { url: "https://etablix.com", label: "Visit etablix.com" },
  },
  construction: {
    id: "construction",
    name: "Nseya Construction",
    shortName: "Construction",
    path: "/construction",
    summary: "Buildings from renovation to mixed-use, and civils, M&E and HVAC for power and digital infrastructure.",
    accent: "cobalt",
    mark: "N",
  },
};

export const companyOrder: TradingCompanyId[] = ["consultancy", "etablix", "construction"];
