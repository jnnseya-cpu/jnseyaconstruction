import type { Vacancy } from "./types";

/**
 * Vacancies (CMS "vacancy" type, edited by the Recruiter role).
 * A vacancy hides automatically after its closing date. Set status "draft"
 * to hold one back; drafts show only where SHOW_DRAFTS is set (staging).
 * Salary, hours and closing dates of both roles: Confirmed by Justin, 26 Nov 2026.
 */
export const vacancies: Vacancy[] = [
  {
    slug: "graduate-academy-project-controls-2027",
    title: "Graduate Academy trainee: project controls",
    company: "consultancy",
    employer: "JNN Global Ltd",
    route: "graduate",
    location: "Birmingham",
    contractType: "fixed-term",
    salary: { min: 26000, max: 28000, period: "YEAR" },
    hours: "37.5 hours a week, Monday to Friday",
    closingDate: "2027-02-28",
    postedDate: "2026-12-01",
    summary:
      "A two-year paid programme for graduates who are still looking for a graduate job three months or more after finishing their degree. Any degree subject.",
    whatYouWillDo: [
      "Update project programmes and track progress against them each week.",
      "Help prepare monthly cost and progress reports for clients.",
      "Rotate through consultancy, site services and construction teams.",
    ],
    whatYouGet: [
      "A named mentor from day one.",
      "CSCS card and site safety training, paid for.",
      "SSSTS in year one and support towards CIOB, RICS, ICE or IET membership.",
      "Training in CONSTRUX and VERYX, the group's project and business systems.",
    ],
    whatWeLookFor: [
      "A degree in any subject.",
      "Comfortable with numbers and spreadsheets.",
      "Reliable, and willing to learn on site as well as in the office.",
    ],
    status: "published",
  },
  {
    slug: "trainee-document-controller-2027",
    title: "Trainee document controller (apprenticeship)",
    company: "construction",
    employer: "JNN Global Ltd",
    route: "apprentice",
    location: "Birmingham",
    contractType: "apprenticeship",
    salary: { min: 12.21, max: 12.21, period: "HOUR" },
    hours: "37.5 hours a week, including one day of training",
    closingDate: "2027-01-31",
    postedDate: "2026-12-01",
    summary:
      "An apprenticeship for someone who wants to start a career in construction. You do not need any experience. Training is fully funded.",
    whatYouWillDo: [
      "Keep drawings and documents up to date so the site team always has the right version.",
      "Upload and file documents in CONSTRUX.",
      "Help the project manager prepare for meetings.",
    ],
    whatYouGet: [
      "A paid apprenticeship with a recognised qualification.",
      "A mentor who has worked in construction.",
      "A CSCS card and site safety training.",
    ],
    whatWeLookFor: [
      "Aged 16 or over.",
      "Organised and careful with detail.",
      "Happy to use a computer every day. We will teach you the rest.",
    ],
    status: "published",
  },
];
