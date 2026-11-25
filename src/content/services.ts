import type { Service } from "./types";

/**
 * Consultancy wording: Phase 1 copy deck (25 Nov 2026).
 * All services across the three companies (PG-06). Each gets its own page in
 * Phase 2 (PG-07 to PG-18); in Phase 1 they are anchored sections on the
 * company pages.
 */
export const services: Service[] = [
  // Nseya Consultancy (PG-03)
  {
    slug: "project-management",
    company: "consultancy",
    name: "Project and programme management",
    summary: "From business case to handover. One accountable lead, one plan, no drift.",
    sectors: ["public-estate", "social-housing", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "cost-management",
    company: "consultancy",
    name: "Cost management",
    summary: "Estimates, cost plans, value engineering, valuations and final accounts. Every pound tracked from day one.",
    sectors: ["public-estate", "social-housing", "commercial-mixed-use", "residential"],
    pagePhase: "P2",
  },
  {
    slug: "project-controls",
    company: "consultancy",
    name: "Project controls",
    summary: "Baseline programmes, earned value, risk and change control, live in CONSTRUX dashboards. You'll know you're slipping before it happens.",
    sectors: ["public-estate", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "feasibility-studies",
    company: "consultancy",
    name: "Feasibility studies",
    summary: "Site, options, cost, programme and funding route, answered before you spend real money.",
    sectors: ["public-estate", "social-housing", "commercial-mixed-use", "residential"],
    pagePhase: "P2",
  },
  {
    slug: "bim-information-management",
    company: "consultancy",
    name: "BIM and information management (ISO 19650)",
    summary: "Solve it in the model, not on site.",
    sectors: ["public-estate", "social-housing", "energy-grid", "data-centres", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "building-safety",
    company: "consultancy",
    name: "Building safety and compliance",
    summary: "Gateway 2 and 3 readiness, golden thread, CDM client advice.",
    sectors: ["public-estate", "social-housing", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "tender-and-procurement",
    company: "consultancy",
    name: "Tender and procurement management",
    summary: "Procurement strategy, tender packs and evaluation that stand up under the Procurement Act.",
    sectors: ["public-estate", "social-housing", "energy-grid", "commercial-mixed-use"],
    pagePhase: "P2",
  },
  {
    slug: "bid-on",
    company: "consultancy",
    name: "Bid-On for contractors",
    summary: "Prequalification, framework and tender packs for SME contractors entering energy and public-sector supply chains.",
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
