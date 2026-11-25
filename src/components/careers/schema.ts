import { z } from "zod";
import { consent, email, opt, phone, req } from "@/lib/forms/validate";

/* Shared by the FM-04 server actions and the client forms. No server-only imports here. */

export const routeOptions = [
  { value: "graduate", label: "Graduate Academy", hint: "Graduates still looking for a graduate job" },
  { value: "apprentice", label: "Apprenticeship", hint: "Paid job with fully funded training" },
  { value: "trainee", label: "Trainee role", hint: "No experience needed" },
  { value: "experienced", label: "Experienced role", hint: "Managers and specialists" },
] as const;

export const areaOptions = [
  { value: "site-management", label: "Site supervision and management" },
  { value: "project-controls", label: "Project controls and planning" },
  { value: "commercial", label: "Commercial and cost management" },
  { value: "document-control", label: "Document control and administration" },
  { value: "site-services", label: "Site services (ETABLIX)" },
  { value: "mep", label: "Mechanical, electrical and HVAC" },
  { value: "hseq", label: "Health, safety, environment and quality" },
] as const;

export const heardOptions = [
  { value: "jobcentre", label: "Jobcentre Plus" },
  { value: "wmca", label: "WMCA Construction Gateway" },
  { value: "university", label: "University careers service" },
  { value: "other", label: "Somewhere else" },
] as const;

export const companyFilterOptions = [
  { value: "group", label: "Nseya Groupe" },
  { value: "consultancy", label: "Nseya Consultancy" },
  { value: "etablix", label: "ETABLIX" },
  { value: "construction", label: "Nseya Construction" },
] as const;

export const contractLabels = {
  permanent: "Permanent",
  "fixed-term": "Fixed term",
  apprenticeship: "Apprenticeship",
  "part-time": "Part time",
} as const;

const routeValues = ["graduate", "apprentice", "trainee", "experienced"] as const;
const areaValues = areaOptions.map((a) => a.value) as unknown as readonly [string, ...string[]];

/** FM-04 application. CV route or guided no-CV route; no CV never blocks an application. */
export const applicationSchema = z
  .object({
    name: req("your name", 120),
    email,
    phone: phone(true),
    role: req("the role you are applying for", 160),
    rightToWork: z.enum(["yes", "no"], { error: "Tell us if you have the right to work in the UK" }),
    applyRoute: z.enum(["cv", "no-cv"], { error: "Choose how you want to apply" }),
    aboutYou: opt(2000),
    experience: opt(2000),
    whyConstruction: opt(2000),
    graduationDate: opt(40),
    degree: opt(160),
    vacancySlug: opt(120),
    consent,
  })
  .superRefine((d, ctx) => {
    if (d.applyRoute === "no-cv") {
      if (!d.aboutYou) ctx.addIssue({ code: "custom", path: ["aboutYou"], message: "Tell us a little about yourself" });
      if (!d.whyConstruction) ctx.addIssue({ code: "custom", path: ["whyConstruction"], message: "Tell us why you want to work in construction" });
    }
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Voluntary, never used for shortlisting; stored apart from the application. */
export const referralSchema = z.object({
  heardFrom: z.enum(["jobcentre", "wmca", "university", "other"]).optional().or(z.literal("")).transform((v) => v || undefined),
  workCoach: z.enum(["yes", "no"]).optional().or(z.literal("")).transform((v) => v || undefined),
});

/** Optional equality monitoring; stored with no link to the applicant. */
export const equalitySchema = z.object({
  eqAge: opt(40),
  eqGender: opt(60),
  eqEthnicity: opt(80),
  eqDisability: opt(40),
});

export const talentPoolSchema = z.object({
  name: req("your name", 120),
  email,
  phone: phone(false),
  location: opt(120),
  routes: z.array(z.enum(routeValues)).min(1, "Choose at least one route"),
  areas: z.array(z.enum(areaValues)).min(1, "Choose at least one area"),
  message: opt(2000),
  consent,
});

export const jobAlertSchema = z.object({
  email,
  routes: z.array(z.enum(routeValues)).min(1, "Choose at least one type of role"),
  consent,
});
