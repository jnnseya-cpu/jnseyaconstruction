import { describe, expect, it } from "vitest";
import { applicationSchema } from "@/components/careers/schema";
import type { Vacancy } from "@/content/types";
import { closingInstant, isVacancyOpen } from "@/lib/cms";

const base = (over: Partial<Vacancy>): Vacancy => ({
  slug: "x", title: "X", company: "group", employer: "JNN Global Ltd", route: "graduate", location: "Birmingham",
  contractType: "permanent", salary: { min: 1, max: 1, period: "YEAR" }, hours: "", closingDate: "2027-01-31",
  postedDate: "2026-12-01", summary: "", whatYouWillDo: [], whatYouGet: [], whatWeLookFor: [], status: "published", ...over,
});

describe("vacancy closing (CR-05: closed vacancies disappear)", () => {
  it("closes at 23:59:59 London time in winter (GMT)", () => {
    expect(closingInstant("2027-01-31").toISOString()).toBe("2027-01-31T23:59:59.000Z");
    const v = base({ closingDate: "2027-01-31" });
    expect(isVacancyOpen(v, new Date("2027-01-31T23:59:00Z"), false)).toBe(true);
    expect(isVacancyOpen(v, new Date("2027-02-01T00:00:01Z"), false)).toBe(false);
  });

  it("closes at 23:59:59 London time in summer (BST = UTC+1)", () => {
    expect(closingInstant("2027-07-31").toISOString()).toBe("2027-07-31T22:59:59.000Z");
    const v = base({ closingDate: "2027-07-31" });
    expect(isVacancyOpen(v, new Date("2027-07-31T22:59:00Z"), false)).toBe(true);
    // 00:30 BST on 1 August is still 31 July in UTC, but the vacancy must be closed.
    expect(isVacancyOpen(v, new Date("2027-07-31T23:30:00Z"), false)).toBe(false);
  });

  it("handles closing dates on the clock-change days", () => {
    // Clocks go forward 28 March 2027 and back 31 October 2027: both end the day in BST/GMT respectively.
    expect(closingInstant("2027-03-28").toISOString()).toBe("2027-03-28T22:59:59.000Z");
    expect(closingInstant("2027-10-31").toISOString()).toBe("2027-10-31T23:59:59.000Z");
  });

  it("hides drafts unless drafts are shown", () => {
    const v = base({ status: "draft", closingDate: "2099-01-01" });
    expect(isVacancyOpen(v, new Date("2027-01-01"), false)).toBe(false);
    expect(isVacancyOpen(v, new Date("2027-01-01"), true)).toBe(true);
  });
});

describe("FM-04 application schema", () => {
  const common = { name: "Sam Patel", email: "sam@example.com", phone: "0121 000 0000", role: "Apprenticeship", rightToWork: "yes", consent: "yes" };

  it("accepts the no-CV route with the guided answers", () => {
    const r = applicationSchema.safeParse({ ...common, applyRoute: "no-cv", aboutYou: "I like fixing things.", whyConstruction: "I want to build homes.", experience: "" });
    expect(r.success).toBe(true);
  });

  it("asks for the guided answers when there is no CV", () => {
    const r = applicationSchema.safeParse({ ...common, applyRoute: "no-cv" });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["aboutYou", "whyConstruction"]));
  });

  it("accepts the CV route without the guided answers (file checked by the action)", () => {
    expect(applicationSchema.safeParse({ ...common, applyRoute: "cv" }).success).toBe(true);
  });

  it("requires consent and a right-to-work answer", () => {
    const r = applicationSchema.safeParse({ ...common, rightToWork: "", consent: "", applyRoute: "cv" });
    expect(r.success).toBe(false);
  });
});
