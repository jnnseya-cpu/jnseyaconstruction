import type { Service } from "./types";

/**
 * All services across the three companies (PG-06). Each gets its own page in
 * Phase 2 (PG-07 to PG-18); in Phase 1 they are anchored sections on the
 * company pages.
 */
export const services: Service[] = [
  // Nseya Consultancy (PG-03)
  {
    slug: "project-management",
    company: "consultancy",
    name: "Project management",
    summary: "Client-side project management from brief to handover, run to RIBA Plan of Work stages and NEC4 contract management.",
    sectors: ["public-estate", "social-housing", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "cost-management",
    company: "consultancy",
    name: "Cost management",
    summary: "Cost plans, estimates, valuations and final accounts, with cost reported against budget every month.",
    sectors: ["public-estate", "social-housing", "commercial-mixed-use", "residential"],
    pagePhase: "P2",
  },
  {
    slug: "project-controls",
    company: "consultancy",
    name: "Project controls",
    summary: "Programme, risk and change control, with earned value reported from one set of project data.",
    sectors: ["public-estate", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "feasibility-studies",
    company: "consultancy",
    name: "Feasibility studies",
    summary: "Site, cost and programme feasibility to test whether a scheme is worth taking forward, before design spend.",
    sectors: ["public-estate", "social-housing", "commercial-mixed-use", "residential"],
    pagePhase: "P2",
  },
  {
    slug: "bim-information-management",
    company: "consultancy",
    name: "BIM and information management",
    summary: "Information management to ISO 19650: information requirements, the delivery plan and a common data environment run for the whole team.",
    sectors: ["public-estate", "social-housing", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "tender-and-procurement",
    company: "consultancy",
    name: "Tender and procurement management",
    summary: "Procurement strategy, tender documents, evaluation and contract award under the Procurement Act 2023.",
    sectors: ["public-estate", "social-housing", "energy-grid", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "bid-on",
    company: "consultancy",
    name: "Bid-On",
    summary: "Bid management for contractors and suppliers: bid/no-bid review, quality answers, pricing support and compliance checks.",
    sectors: ["public-estate", "social-housing", "energy-grid", "data-centres"],
    pagePhase: "P2",
  },
  // ETABLIX (PG-04)
  {
    slug: "integrated-site-services",
    company: "etablix",
    name: "Integrated site services (TSLM)",
    summary: "Cabins, welfare, security, cleaning and the other site-services trades, managed through one lifecycle method.",
    sectors: ["public-estate", "energy-grid", "data-centres", "commercial-mixed-use", "social-housing"],
    pagePhase: "P2",
  },
  {
    slug: "workforce-villages",
    company: "etablix",
    name: "Workforce villages (WVLM)",
    summary: "Accommodation, meals and transport for large project workforces, planned around the workforce peak.",
    sectors: ["energy-grid", "data-centres"],
    pagePhase: "P2",
  },
  // Nseya Construction (PG-05)
  {
    slug: "renovations-and-extensions",
    company: "construction",
    name: "Renovations, extensions and lofts",
    summary: "Renovations, extensions and loft conversions, moving across from jnseya.co.uk during 2027.",
    sectors: ["residential", "social-housing"],
    pagePhase: "P3",
  },
  {
    slug: "design-and-build-housing",
    company: "construction",
    name: "Design and build housing",
    summary: "Small-site housing and new build delivered design and build, from planning drawings to completion.",
    sectors: ["social-housing", "residential"],
    pagePhase: "P2",
  },
  {
    slug: "commercial-and-mixed-use",
    company: "construction",
    name: "Commercial and mixed-use buildings",
    summary: "Fit-out, refurbishment and new build for commercial and mixed-use schemes and the public estate.",
    sectors: ["public-estate", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "substation-civils",
    company: "construction",
    name: "Substation and generation civils",
    summary: "Foundations, bunds, cable trenches, control-building shells and access roads for substations and generation sites.",
    sectors: ["energy-grid", "data-centres"],
    pagePhase: "P2",
  },
  {
    slug: "cable-civils",
    company: "construction",
    name: "33kV and 132kV cable civils",
    summary: "Cable-route trenching, ducting, HDD crossings and joint bays for 33kV and 132kV circuits.",
    sectors: ["energy-grid", "data-centres"],
    pagePhase: "P2",
  },
  {
    slug: "data-centre-construction",
    company: "construction",
    name: "Data-centre civils and fit-out",
    summary: "Civils, power distribution and cooling packages for data-centre halls and campuses.",
    sectors: ["data-centres"],
    pagePhase: "P2",
  },
  {
    slug: "mechanical-electrical-hvac",
    company: "construction",
    name: "M&E, HVAC and building services",
    summary: "Mechanical, electrical, heating, ventilation and air-conditioning installation, testing and commissioning.",
    sectors: ["public-estate", "data-centres", "commercial-mixed-use", "social-housing"],
    pagePhase: "P2",
  },
];
