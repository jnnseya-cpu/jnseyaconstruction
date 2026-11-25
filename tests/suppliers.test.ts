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
