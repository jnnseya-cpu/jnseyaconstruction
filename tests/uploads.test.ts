import { describe, expect, it } from "vitest";
import { collectFileIds } from "@/lib/forms/blob";
import { checkUpload, contentTypeFor } from "@/lib/forms/upload-rules";
import { decodeTicket, encodeTicket, signatureMatches } from "@/lib/forms/uploads";

const ticket = { id: "0b6f3c1e-8a7d-4f0e-9a51-2c3d4e5f6a7b.pdf", kind: "cv" as const, name: "cv.pdf", size: 1000, exp: Date.now() + 60_000 };

describe("upload receipts", () => {
  it("round-trips a signed receipt", () => {
    expect(decodeTicket(encodeTicket(ticket))).toEqual(ticket);
  });
  it("rejects a tampered receipt", () => {
    const r = encodeTicket(ticket);
    const [payload, mac] = r.slice(4).split(".");
    const forged = Buffer.from(JSON.stringify({ ...ticket, size: 99_000_000 })).toString("base64url");
    expect(decodeTicket(`upl.${forged}.${mac}`)).toBeNull();
    expect(decodeTicket(`upl.${payload}.x${mac.slice(1)}`)).toBeNull();
  });
  it("rejects an expired receipt", () => {
    expect(decodeTicket(encodeTicket({ ...ticket, exp: Date.now() - 1 }))).toBeNull();
  });
});

describe("upload rules", () => {
  it("enforces type and size per kind", () => {
    expect(checkUpload("cv", "cv.docx", 5 * 1048576)).toBeNull();
    expect(checkUpload("cv", "cv.png", 1000)).toMatch(/PDF, DOCX/);
    expect(checkUpload("cv", "cv.pdf", 11 * 1048576)).toMatch(/10MB/);
    expect(checkUpload("attachment", "plan.pdf", 19 * 1048576)).toBeNull();
    expect(checkUpload("attachment", "plan.pdf", 21 * 1048576)).toMatch(/20MB/);
    expect(checkUpload("document", "cert.exe", 10)).not.toBeNull();
  });
  it("decides content type from the extension", () => {
    expect(contentTypeFor("document", "Cert.PNG")).toBe("image/png");
    expect(contentTypeFor("document", "cert.docx")).toBeUndefined();
  });
  it("checks file signatures", () => {
    expect(signatureMatches("pdf", Buffer.from("%PDF-1.7"))).toBe(true);
    expect(signatureMatches("pdf", Buffer.from("MZ\x90\x00"))).toBe(false);
    expect(signatureMatches("png", Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
  });
});

describe("retention", () => {
  it("finds every stored file in a record", () => {
    const rec = {
      cv: { id: "0b6f3c1e-8a7d-4f0e-9a51-2c3d4e5f6a7b.pdf", name: "cv.pdf", size: 1, type: "pdf", scan: "pending" },
      documents: [{ type: "el", file: { id: "1c6f3c1e-8a7d-4f0e-9a51-2c3d4e5f6a7b.png", name: "el.png", size: 1, type: "png", scan: "clean" } }],
      other: { id: "not-a-file" },
    };
    expect(collectFileIds(rec).sort()).toEqual(["0b6f3c1e-8a7d-4f0e-9a51-2c3d4e5f6a7b.pdf", "1c6f3c1e-8a7d-4f0e-9a51-2c3d4e5f6a7b.png"]);
  });
});
