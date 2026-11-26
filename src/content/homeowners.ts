/**
 * Homeowner services (spec section 5c), sold by Nseya Consultancy.
 * Single source for names, prices and wording: used by /homeowners (HO-01) and
 * the Consultancy and Construction pages. No online booking or payment (Justin,
 * 26 Nov 2026): every "Book" button opens the enquiry form with the service chosen.
 * No prices are published anywhere on the site (Justin, 26 Nov 2026): fees are
 * confirmed in writing in reply to each enquiry.
 */
export type HomeownerServiceSlug = "clarity-call" | "feasibility-report" | "project-roadmap" | "project-management";

export interface HomeownerService {
  slug: HomeownerServiceSlug;
  name: string;
  /** "one-off" or "monthly" (Project Management is monthly, rolling). */
  billing: "one-off" | "monthly";
  short: string;
  gets: string;
  delivery: string;
  next: string;
  core?: boolean;
}

export const homeownerServices: HomeownerService[] = [
  {
    slug: "clarity-call",
    name: "Clarity Call",
    billing: "one-off",
    short: "30 minutes, then a one-page written summary.",
    gets: "A 30-minute video or phone call on your plans, then a one-page written summary of the main risks, the likely cost range and your next steps.",
    delivery: "Summary within 2 working days of the call.",
    next: "Book a Feasibility Report within 30 days and we credit the fee for your Clarity Call against it.",
  },
  {
    slug: "feasibility-report",
    name: "Feasibility Report",
    billing: "one-off",
    short: "Site visit, independent report in 5 working days.",
    gets: "A site visit and an independent written report on whether your project is buildable, sensible and fairly priced: constraints, likely cost range, builder quotes checked, programme, permissions needed and risks. Plus a builder brief template, a shortlist of vetted local trades and a 30-minute walkthrough call.",
    delivery: "Report within 5 working days of the visit.",
    next: "A Project Roadmap or Project Management.",
    core: true,
  },
  {
    slug: "project-roadmap",
    name: "Project Roadmap",
    billing: "one-off",
    short: "For buyers and larger projects: cost, plan, permissions, risks.",
    gets: "Before you exchange or start design: what the improvement will really cost, a step-by-step plan, the permissions and approvals route, a programme and a risk register. Chartered surveyor sign-off through a named partner when a formal survey letter is needed.",
    delivery: "Within 5 working days of the visit.",
    next: "Project Management.",
  },
  {
    slug: "project-management",
    name: "Project Management",
    billing: "monthly",
    short: "We manage your builder for you, month by month.",
    gets: "Client-side management of your build: tendering and comparing builder quotes, contract set-up, stage-payment checks, regular site visits and quality checks, change and cost control, snagging and handover.",
    delivery: "Monthly, rolling.",
    next: "The build, by the builder you choose. That can be Nseya Construction.",
  },
];

/** TO CONFIRM: postcodes and travel radius. */
export const homeownerArea = "Birmingham and the West Midlands";

export const homeownerPromises = {
  promise: "Independent, builder-honest advice before you spend on the build; a fixed fee, in writing, in 5 working days.",
  guarantee: "If the Feasibility Report does not give a clear go or no-go decision, we rework it free or refund in full.",
  independence:
    "Our advice is independent. If you later invite Nseya Construction to quote, we tell you in writing, it is your choice, and our quote is compared fairly against others. We never make a report conditional on using us.",
  notA: "A Feasibility Report or Project Roadmap is not a RICS building survey, a structural design or a planning application. Where a formal surveyor's letter or structural calculation is needed, a named chartered partner provides it, and it is labelled as theirs.",
};

export const homeownerService = (slug: string) => homeownerServices.find((s) => s.slug === slug);

/** Enquiry link with the service pre-selected (enquiry types in src/lib/forms/enquiry-options.ts). */
export const homeownerEnquiryHref = (slug: HomeownerServiceSlug) =>
  `/contact?company=consultancy&type=${slug === "project-management" ? "home-project-management" : slug}#enquiry`;
