import { describe, expect, it } from "vitest";
import { checkMinimums, minimums } from "@/lib/suppliers/minimums";
import { csvField, daysUntil, expiredDocs, normaliseCompanyNumber, reminderKey, remindersDue, skipsHealthAndSafety, toCsv } from "@/lib/suppliers/rules";

const now = new Date("2027-03-01T09:00:00Z");
const plus = (days: number) => new Date(now.getTime() + days * 86400_000).toISOString().slice(0, 10);

describe("group minimums", () => {
  it("passes standard limits", () => {
    const r = checkMinimums({ el: { limit: 10_000_000 }, pl: { limit: 5_000_000 } }, { powerOrHighway: false, designer: false });
    expect(r.every((x) => x.ok)).toBe(true);
    expect(r.map((x) => x.key)).toEqual(["el", "pl"]);
  });
  it("requires £10m public liability for power and highway work", () => {
    const r = checkMinimums({ el: { limit: 10_000_000 }, pl: { limit: 5_000_000 } }, { powerOrHighway: true, designer: false });
    expect(r.find((x) => x.key === "pl")).toMatchObject({ ok: false, required: minimums.publicLiabilityPowerHighway });
  });
  it("requires PI only for designers", () => {
    const r = checkMinimums({ el: { limit: 10_000_000 }, pl: { limit: 5_000_000 } }, { powerOrHighway: false, designer: true });
    expect(r.find((x) => x.key === "pi")).toMatchObject({ ok: false, required: 1_000_000 });
  });
  it("fails a missing or low limit", () => {
    const r = checkMinimums({ el: { limit: 5_000_000 } }, { powerOrHighway: false, designer: false });
    expect(r.map((x) => x.ok)).toEqual([false, false]);
  });
});

describe("company number validation", () => {
  it.each([
    ["12345678", "12345678"],
    ["1234567", "01234567"],
    ["sc123456", "SC123456"],
    ["NI 123456", "NI123456"],
    ["OC123456", "OC123456"],
  ])("accepts %s", (input, out) => expect(normaliseCompanyNumber(input)).toBe(out));
  it.each(["", "123456789", "S1234567", "ABC12345", "12-34-56"])("rejects %s", (input) => expect(normaliseCompanyNumber(input)).toBeNull());
});

describe("Common Assessment Standard skip rule", () => {
  it("skips with a valid SSIP certificate", () => {
    expect(skipsHealthAndSafety({ ssipSchemes: ["CHAS"], ssipExpiry: plus(10) }, now).skip).toBe(true);
  });
  it("does not skip with an expired SSIP certificate", () => {
    expect(skipsHealthAndSafety({ ssipSchemes: ["CHAS"], ssipExpiry: plus(-1) }, now).skip).toBe(false);
  });
  it("skips with Constructionline Gold or Platinum, not Silver", () => {
    expect(skipsHealthAndSafety({ constructionline: "gold", constructionlineExpiry: plus(100) }, now).skip).toBe(true);
    expect(skipsHealthAndSafety({ constructionline: "platinum", constructionlineExpiry: plus(100) }, now).skip).toBe(true);
    expect(skipsHealthAndSafety({ constructionline: "silver", constructionlineExpiry: plus(100) }, now).skip).toBe(false);
  });
  it("does not skip with nothing", () => {
    expect(skipsHealthAndSafety({}, now).skip).toBe(false);
  });
});

describe("expiry reminders", () => {
  const doc = (id: string, days: number) => ({ id, label: id, expiry: plus(days) });

  it("counts whole days to the end of the expiry day", () => {
    expect(daysUntil(plus(0), now)).toBe(0);
    expect(daysUntil(plus(30), now)).toBe(30);
    expect(daysUntil(plus(-1), now)).toBe(-1);
  });
  it("sends the 30-day reminder inside 30 days and the 7-day reminder inside 7", () => {
    const due = remindersDue([doc("a", 31), doc("b", 30), doc("c", 8), doc("d", 7), doc("e", 0), doc("f", -2)], [], now);
    expect(due.map((d) => `${d.doc.id}:${d.stage}`)).toEqual(["b:30", "c:30", "d:7", "e:7"]);
  });
  it("is idempotent once a reminder key is recorded", () => {
    const d = doc("b", 20);
    expect(remindersDue([d], [reminderKey(d, 30)], now)).toEqual([]);
  });
  it("sends only the 7-day reminder if the 30-day one was missed", () => {
    expect(remindersDue([doc("x", 5)], [], now).map((r) => r.stage)).toEqual([7]);
  });
  it("starts afresh when a document is renewed with a new expiry", () => {
    const old = doc("x", 20);
    const renewed = { ...old, expiry: plus(380) };
    expect(remindersDue([renewed], [reminderKey(old, 30)], now)).toEqual([]);
    expect(reminderKey(renewed, 30)).not.toBe(reminderKey(old, 30));
  });
  it("ignores superseded documents and flags expired ones", () => {
    expect(remindersDue([{ ...doc("s", 3), superseded: true }], [], now)).toEqual([]);
    expect(expiredDocs([doc("e", -1), { ...doc("s", -1), superseded: true }, doc("ok", 1)], now).map((d) => d.id)).toEqual(["e"]);
  });
});

describe("CSV export", () => {
  it("escapes commas, quotes and newlines", () => {
    expect(csvField('Smith, "Jones" & Co')).toBe('"Smith, ""Jones"" & Co"');
    expect(csvField("a\nb")).toBe('"a\nb"');
    expect(csvField(["x", "y"])).toBe("x; y");
    expect(csvField(undefined)).toBe("");
  });
  it("neutralises spreadsheet formulas", () => {
    expect(csvField("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvField("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(csvField("+44 121 000 0000")).toBe("+44 121 000 0000");
  });
  it("builds CRLF rows with a header", () => {
    expect(toCsv(["a", "b"], [[1, "x,y"]])).toBe('a,b\r\n1,"x,y"\r\n');
  });
});

import { businessTypeLabel, isRegisteredBusiness } from "@/lib/suppliers/catalogue";

describe("business types", () => {
  it("asks for a company number only from companies and LLPs", () => {
    expect(isRegisteredBusiness("limited")).toBe(true);
    expect(isRegisteredBusiness("llp")).toBe(true);
    expect(isRegisteredBusiness("sole-trader")).toBe(false);
    expect(isRegisteredBusiness("partnership")).toBe(false);
  });
  it("treats older records without a type as limited companies", () => {
    expect(isRegisteredBusiness(undefined)).toBe(true);
    expect(businessTypeLabel(undefined)).toBe("Limited company");
  });
});

import { automaticChecks } from "@/lib/suppliers/checks";
import { construxCsv, construxHeaders } from "@/lib/suppliers/export";
import { parseRegisterResponse } from "@/lib/suppliers/environmentAgency";
import type { SupplierRecord } from "@/lib/suppliers/model";
import {
  computeOrderGates, gatedWorkFor, newlyBlocked, normaliseWasteCarrierNumber, requiredTickets, suspendingExpired, ticketStatus,
} from "@/lib/suppliers/tickets";

const work = (over: Partial<{ categories: string[]; trades: string[]; capabilities: string[] }> = {}) => ({ categories: ["trade"], trades: ["Groundworks"], capabilities: [], ...over });
const file = { id: "f", name: "x.pdf", size: 10, type: "application/pdf", scan: "clean" } as unknown as SupplierRecord["documents"][number]["file"];
const tdoc = (type: string, days?: number) => ({ id: type, type, label: type, expiry: days === undefined ? undefined : plus(days), file, uploadedAt: now.toISOString() });

describe("which tickets a supplier needs", () => {
  it("needs none for general trade work", () => {
    expect(requiredTickets(work())).toEqual([]);
  });
  it("needs SHEA Power for power-site work (power category, HV or live substations)", () => {
    for (const w of [work({ categories: ["power"] }), work({ capabilities: ["hv"] }), work({ capabilities: ["live-substation"] }), work({ trades: ["HV jointing"] })]) {
      expect(requiredTickets(w).map((r) => r.ticket.id)).toEqual(["shea-power"]);
    }
  });
  it("needs NSI 30 and SHEA Power inside National Grid substations", () => {
    expect(gatedWorkFor(work({ capabilities: ["ng-substation"] })).map((g) => g.id)).toEqual(["power-site", "ng-substation"]);
    expect(requiredTickets(work({ capabilities: ["ng-substation"] })).map((r) => r.ticket.id)).toEqual(["shea-power", "nsi30"]);
  });
  it("needs a waste carrier registration from anyone who removes waste", () => {
    expect(requiredTickets(work({ capabilities: ["removes-waste"] })).map((r) => r.ticket.id)).toEqual(["waste-carrier"]);
  });
});

describe("waste carrier number validation", () => {
  it.each([
    ["CBDU123456", "CBDU123456", "upper"],
    ["cbdl 12345", "CBDL12345", "lower"],
    ["CBDU-1", "CBDU1", "upper"],
  ])("accepts %s", (input, n, tier) => expect(normaliseWasteCarrierNumber(input)).toEqual({ number: n, tier }));
  it.each(["", "CBDX123", "CBDU", "CBD123456", "WEX123456", "CBDU12A456", "CBDU123456789"])("rejects %s", (input) => expect(normaliseWasteCarrierNumber(input)).toBeNull());
});

describe("ticket status and order gates", () => {
  const holder = (tickets: SupplierRecord["accreditations"]["tickets"], documents: ReturnType<typeof tdoc>[], w = work({ capabilities: ["ng-substation", "removes-waste"] })) => ({
    work: w, accreditations: { tickets }, documents,
  });

  it("blocks every gated work type when tickets are missing, but lists only work the supplier does", () => {
    const gates = computeOrderGates(holder({}, []), now);
    expect(gates.map((g) => [g.work, g.eligible])).toEqual([["power-site", false], ["ng-substation", false], ["waste-removal", false]]);
    expect(gates[1].blockedBy.map((b) => b.ticket)).toEqual(["nsi30", "shea-power"]);
    expect(gates[0].blockedBy[0]).toMatchObject({ reason: "missing", docType: "shea-power-cards" });
    expect(computeOrderGates(holder({}, [], work()), now)).toEqual([]);
  });
  it("is eligible with live tickets and blocks only the work an expired ticket covers", () => {
    const t = { "shea-power": { number: "123", expiry: plus(100) }, nsi30: { number: "N1", expiry: plus(-1) }, "waste-carrier": { number: "CBDU1", expiry: plus(200) } };
    const gates = computeOrderGates(holder(t, [tdoc("shea-power-cards", 100), tdoc("nsi30-auth", -1), tdoc("waste-carrier-cert", 200)]), now);
    expect(gates.map((g) => [g.work, g.eligible])).toEqual([["power-site", true], ["ng-substation", false], ["waste-removal", true]]);
    expect(gates[1].blockedBy).toEqual([expect.objectContaining({ ticket: "nsi30", reason: "expired" })]);
  });
  it("needs the upload as well as the number", () => {
    expect(ticketStatus(holder({ "shea-power": { number: "1", expiry: plus(10) } }, []), "shea-power", now).state).toBe("missing");
  });
  it("uses the renewed document's expiry and flags tickets expiring within 30 days", () => {
    const h = holder({ "shea-power": { number: "1", expiry: plus(-5) } }, [tdoc("shea-power-cards", 20)]);
    expect(ticketStatus(h, "shea-power", now)).toMatchObject({ state: "expiring", days: 20 });
  });
  it("blocks waste removal when the number is not on the register, but not when the register was unavailable", () => {
    const w = (result: "fail" | "not-checked") => holder({ "waste-carrier": { number: "CBDU1", expiry: plus(300), register: { result, detail: "x", checkedAt: "" } } }, [tdoc("waste-carrier-cert", 300)], work({ capabilities: ["removes-waste"] }));
    expect(computeOrderGates(w("fail"), now)[0]).toMatchObject({ eligible: false, blockedBy: [expect.objectContaining({ reason: "not-on-register" })] });
    expect(computeOrderGates(w("not-checked"), now)[0].eligible).toBe(true);
  });
  it("treats lower-tier (CBDL) waste registrations as not expiring", () => {
    const h = holder({ "waste-carrier": { number: "CBDL99" } }, [tdoc("waste-carrier-cert")], work({ capabilities: ["removes-waste"] }));
    expect(ticketStatus(h, "waste-carrier", now).state).toBe("valid");
    expect(ticketStatus(holder({ "waste-carrier": { number: "CBDU99" } }, [tdoc("waste-carrier-cert")]), "waste-carrier", now).state).toBe("missing");
  });
  it("prefers Constructionline Gold", () => {
    const h = (level: string) => ({ accreditations: { constructionline: level, constructionlineNumber: "C1", constructionlineExpiry: plus(50) }, documents: [tdoc("constructionline-cert", 50)] });
    expect(ticketStatus(h("gold"), "constructionline", now).state).toBe("valid");
    expect(ticketStatus(h("silver"), "constructionline", now).state).toBe("below-gold");
  });
  it("reports newly blocked gates once", () => {
    const before = computeOrderGates(holder({ "shea-power": { number: "1", expiry: plus(5) } }, [tdoc("shea-power-cards", 5)], work({ categories: ["power"] })), now);
    const later = new Date(now.getTime() + 10 * 86400_000);
    const after = computeOrderGates(holder({ "shea-power": { number: "1", expiry: plus(5) } }, [tdoc("shea-power-cards", 5)], work({ categories: ["power"] })), later);
    expect(before[0].eligible).toBe(true);
    expect(newlyBlocked(before, after).map((g) => g.work)).toEqual(["power-site"]);
    expect(newlyBlocked(after, after)).toEqual([]);
  });
});

describe("expiry: tickets block work, not the whole supplier", () => {
  it("does not suspend from all awards for an expired ticket-only document", () => {
    const docs = [tdoc("nsi30-auth", -1), tdoc("cyber-essentials-cert", -3), tdoc("pl", 10)];
    expect(suspendingExpired(docs, now)).toEqual([]);
    expect(suspendingExpired([...docs, tdoc("el", -1)], now).map((d) => d.type)).toEqual(["el"]);
  });
  it("still sends 30- and 7-day reminders for tickets", () => {
    expect(remindersDue([tdoc("shea-power-cards", 25), tdoc("nsi30-auth", 6)], [], now).map((r) => `${r.doc.type}:${r.stage}`)).toEqual(["shea-power-cards:30", "nsi30-auth:7"]);
  });
  it("keeps the SSIP / Constructionline Gold skip rule", () => {
    expect(skipsHealthAndSafety({ constructionline: "gold", constructionlineExpiry: plus(10) }, now)).toEqual({ skip: true, reason: "Constructionline Gold" });
  });
});

describe("automatic checks and CONSTRUX export include the tickets", () => {
  const rec: SupplierRecord = {
    email: "a@example.com",
    company: { legalName: "Test Ltd", companyNumber: "12345678", registeredAddress: "x", yearsTrading: "1-2", size: "micro", contactName: "A", phone: "0121", regions: ["London"] },
    work: { ...work({ categories: ["power"], capabilities: ["removes-waste"] }), jobSize: "25k-100k" },
    accreditations: { iso: [], other: [], tickets: { "waste-carrier": { number: "CBDU123", expiry: plus(400), register: { result: "pass", detail: "live", checkedAt: "" } } } },
    insurance: { el: { limit: 10_000_000, expiry: plus(100) }, pl: { limit: 10_000_000, expiry: plus(100) } },
    policies: { modernSlavery: true, antiBribery: true, supplierCode: true, platformRule: true, cis: "gross" },
    documents: [tdoc("el", 100), tdoc("pl", 100), tdoc("hs-policy"), tdoc("waste-carrier-cert", 400)],
    status: "applied", suspended: false, checks: [], prequalificationTask: "open", remindersSent: [], submittedAt: now.toISOString(),
    declaration: { truthful: true, consent: true, at: now.toISOString() },
  };
  it("adds a register check and one check per order gate", () => {
    const checks = automaticChecks(rec, "active", now);
    expect(checks.find((c) => c.check === "Waste carrier register")?.result).toBe("pass");
    expect(checks.find((c) => c.check === "Order gate: Power-site work")).toMatchObject({ result: "fail" });
    expect(checks.find((c) => c.check === "Order gate: Removing waste from site")).toMatchObject({ result: "pass" });
  });
  it("exports ticket and gate columns with unique headers", () => {
    expect(new Set(construxHeaders).size).toBe(construxHeaders.length);
    const csv = construxCsv([{ ref: "SUP-2027-0001", data: rec }], now);
    const [head, row] = csv.trim().split("\r\n");
    const cols = head.split(",");
    const vals = [...`${row},`.matchAll(/("(?:[^"]|"")*"|[^,]*),/g)].map((m) => m[1].replace(/^"|"$/g, "").replace(/""/g, '"'));
    expect(vals.length).toBe(cols.length);
    expect(vals[cols.indexOf("ticket_waste_carrier_number")]).toBe("CBDU123");
    expect(vals[cols.indexOf("ticket_shea_power_status")]).toBe("missing");
    expect(vals[cols.indexOf("orders_eligible")]).toBe("Removing waste from site");
    expect(vals[cols.indexOf("orders_blocked")]).toBe("Power-site work: EUSR SHEA Power missing");
  });
});

describe("Environment Agency register parsing (defensive)", () => {
  it("reads a matching item", () => {
    const j = { items: [{ registrationNumber: "CBDU123", expiryDate: "2099-01-01", holder: { name: "Test Ltd" } }] };
    expect(parseRegisterResponse(j, "CBDU123")).toMatchObject({ number: "CBDU123", name: "Test Ltd", expiry: "2099-01-01", live: true, tier: "upper" });
  });
  it("finds the number in an @id and reads a revoked status", () => {
    const j = { result: { items: [{ "@id": "http://x/registration/CBDU9", registrationStatus: { label: "Revoked" } }] } };
    expect(parseRegisterResponse(j, "CBDU9")).toMatchObject({ live: false });
  });
  it("is not-found for an empty list, and unavailable for an unknown shape or non-matching items", () => {
    expect(parseRegisterResponse({ items: [] }, "CBDU1")).toBe("not-found");
    expect(parseRegisterResponse({ foo: 1 }, "CBDU1")).toBeNull();
    expect(parseRegisterResponse({ items: [{ registrationNumber: "CBDU2" }] }, "CBDU1")).toBeNull();
  });
});
