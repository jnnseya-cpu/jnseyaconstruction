import { describe, expect, it } from "vitest";
import { closingInstant, getAccreditations, getLegalEntity, isVacancyOpen } from "@/lib/cms";
import { formatSalary } from "@/lib/format";
import { companyOptions } from "@/lib/forms/enquiry-options";
import { services } from "@/content/services";
import { sectors } from "@/content/sectors";
import type { Vacancy } from "@/content/types";

describe("legal entity", () => {
  it("defaults to JNN Global Ltd with company number and ICO", () => {
    const e = getLegalEntity("etablix");
    expect(e.legalName).toBe("JNN GLOBAL LTD");
    expect(e.companyNumber).toBe("15405437");
    expect(e.icoRegistration).toBe("C2089949");
  });
});

describe("vacancy closing", () => {
  const v = { status: "published", closingDate: "2027-01-31" } as Vacancy;
  it("closes at the end of the closing day, UK time (GMT)", () => {
    expect(closingInstant("2027-01-31").toISOString()).toBe("2027-01-31T23:59:59.000Z");
    expect(isVacancyOpen(v, new Date("2027-01-31T23:00:00Z"), false)).toBe(true);
    expect(isVacancyOpen(v, new Date("2027-02-01T00:00:01Z"), false)).toBe(false);
  });
  it("uses BST in summer", () => {
    expect(closingInstant("2027-06-30").toISOString()).toBe("2027-06-30T22:59:59.000Z");
  });
  it("hides drafts unless drafts are shown", () => {
    const d = { ...v, status: "draft" } as Vacancy;
    expect(isVacancyOpen(d, new Date("2027-01-01"), false)).toBe(false);
    expect(isVacancyOpen(d, new Date("2027-01-01"), true)).toBe(true);
  });
});

describe("accreditations", () => {
  it("returns no expired certificates", () => {
    expect(getAccreditations(new Date("2030-01-01")).every((a) => a.status === "in-progress" || !a.expiryDate || a.expiryDate >= "2030-01-01")).toBe(true);
  });
});

describe("content integrity", () => {
  it("every service uses known sectors and a unique slug", () => {
    const ids = new Set(sectors.map((s) => s.id));
    const slugs = new Set<string>();
    for (const s of services) {
      for (const sec of s.sectors) expect(ids.has(sec)).toBe(true);
      expect(slugs.has(s.slug)).toBe(false);
      slugs.add(s.slug);
    }
  });
  it("routes enquiries to the three companies or not-sure", () => {
    expect(companyOptions).toEqual(["consultancy", "etablix", "construction", "not-sure"]);
  });
  it("copy avoids banned filler words", () => {
    const text = JSON.stringify(services).toLowerCase();
    for (const w of ["cutting-edge", "seamless", "unlock", "empower", "elevate", "world-class"]) expect(text).not.toContain(w);
  });
});

describe("format", () => {
  it("formats salary ranges", () => {
    expect(formatSalary({ min: 26000, max: 28000, period: "YEAR" })).toBe("£26,000 to £28,000 a year");
  });
});

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { contact, domains } from "@/content/settings";

describe("live domain", () => {
  it("is www.nseyagroup.com with contact@ as the main email", () => {
    expect(domains.canonical).toBe("www.nseyagroup.com");
    expect(contact.email).toBe("contact@nseyagroup.com");
  });
  it.each(["nseyagroup.com", "nseyagroup.co.uk", "nseya.uk", "www.nseyagroupe.com"])("redirects %s to www.nseyagroup.com with the path", (host) => {
    const res = middleware(new NextRequest(`https://${host}/careers?x=1`, { headers: { host } }));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.nseyagroup.com/careers?x=1");
  });
  it("serves www.nseyagroup.com itself", () => {
    const res = middleware(new NextRequest("https://www.nseyagroup.com/", { headers: { host: "www.nseyagroup.com" } }));
    expect(res.status).toBe(200);
  });
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

describe("group name", () => {
  it("is spelled Nseya Group, never Groupe, in the site source", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = path.join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx|css|mjs)$/.test(f) && /Nseya Groupe/i.test(readFileSync(p, "utf8"))) hits.push(p);
      }
    };
    walk("src");
    walk("scripts");
    expect(hits).toEqual([]);
  });
});
