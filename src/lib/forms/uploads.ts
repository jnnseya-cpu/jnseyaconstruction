import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { promote, readObject, removeObject, signedPutUrl, sizeOf, writeObject } from "./blob";
import { RECEIPT_PREFIX, checkUpload, contentTypeFor, extensionOf, uploadErrorField, type UploadKind } from "./upload-rules";

/**
 * Uploads (section 6, rule 3: virus-scanned, private storage, never public).
 *
 * With JavaScript, the browser asks for a ticket, PUTs the file straight to
 * private storage and sends only a signed receipt with the form, so form
 * requests stay small (Vercel caps a request body at 4.5MB). Without
 * JavaScript the file arrives in the form itself and is stored here.
 * Either way the server checks type, size and file signature, and scans
 * when a scanner is configured.
 */

export type { UploadKind };

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  scan: "clean" | "pending";
}

interface Ticket {
  id: string;
  kind: UploadKind;
  name: string;
  size: number;
  exp: number;
}

const TICKET_TTL_MS = 60 * 60 * 1000;

function secret() {
  const s = process.env.UPLOAD_SECRET || process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("UPLOAD_SECRET or SESSION_SECRET must be set");
  return "development-only-upload-secret";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function encodeTicket(t: Ticket): string {
  const payload = Buffer.from(JSON.stringify(t)).toString("base64url");
  return `${RECEIPT_PREFIX}${payload}.${sign(payload)}`;
}

export function decodeTicket(token: string, now = Date.now()): Ticket | null {
  if (!token.startsWith(RECEIPT_PREFIX)) return null;
  const [payload, mac] = token.slice(RECEIPT_PREFIX.length).split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const t = JSON.parse(Buffer.from(payload, "base64url").toString()) as Ticket;
    return t.exp >= now ? t : null;
  } catch {
    return null;
  }
}

const cleanName = (name: string) => name.replace(/[^\w.\- ]/g, "_").slice(0, 120) || "file";

/** Issue a ticket and a signed URL for one direct upload. */
export async function createTicket(kind: UploadKind, name: string, size: number) {
  const problem = checkUpload(kind, name, size);
  if (problem) return { error: problem };
  const ext = extensionOf(name);
  const t: Ticket = { id: `${randomUUID()}.${ext}`, kind, name: cleanName(name), size, exp: Date.now() + TICKET_TTL_MS };
  const receipt = encodeTicket(t);
  const contentType = contentTypeFor(kind, name)!;
  return { receipt, url: await signedPutUrl(t.id, contentType, size, receipt), contentType };
}

/** Magic-byte check so a renamed executable is rejected. */
export function signatureMatches(ext: string, buf: Buffer) {
  if (ext === "pdf") return buf.subarray(0, 5).toString("latin1") === "%PDF-";
  if (ext === "docx" || ext === "xlsx") return buf[0] === 0x50 && buf[1] === 0x4b;
  if (ext === "png") return buf.subarray(1, 4).toString("latin1") === "PNG";
  if (ext === "jpg" || ext === "jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  return false;
}

/**
 * Virus scan hook. Set CLAMAV_URL to a ClamAV REST scanner in production;
 * until then files stay "pending" and staff do not open them until scanned.
 */
async function scan(buf: Buffer): Promise<"clean" | "pending" | "infected"> {
  const url = process.env.CLAMAV_URL;
  if (!url) return "pending";
  try {
    const res = await fetch(url, { method: "POST", body: new Uint8Array(buf), headers: { "content-type": "application/octet-stream" } });
    const json = (await res.json()) as { infected?: boolean };
    return json.infected ? "infected" : "clean";
  } catch {
    return "pending";
  }
}

async function finalise(id: string, name: string, kind: UploadKind, buf: Buffer, area: "incoming" | "direct"): Promise<StoredFile | { error: string }> {
  const ext = extensionOf(name);
  if (!signatureMatches(ext, buf)) {
    if (area === "incoming") await removeObject("incoming", id);
    return { error: `The file does not look like a real ${ext.toUpperCase()} file` };
  }
  const result = await scan(buf);
  if (result === "infected") {
    if (area === "incoming") await removeObject("incoming", id);
    return { error: "The file was rejected by our virus scanner" };
  }
  if (area === "incoming") await promote(id);
  else await writeObject("files", id, buf, contentTypeFor(kind, name)!);
  return { id, name: cleanName(name), size: buf.length, type: ext, scan: result };
}

/** Claim a direct upload from its receipt. Single use: the incoming object is moved. */
export async function claimReceipt(receipt: string, kind: UploadKind): Promise<StoredFile | { error: string }> {
  const t = decodeTicket(receipt);
  if (!t || t.kind !== kind) return { error: "The upload has expired. Please choose the file again" };
  const size = await sizeOf("incoming", t.id);
  if (size === null) return { error: "We did not receive the file. Please choose it again" };
  if (size !== t.size) {
    await removeObject("incoming", t.id);
    return { error: "The file did not upload completely. Please choose it again" };
  }
  return finalise(t.id, t.name, kind, await readObject("incoming", t.id), "incoming");
}

/** Store a file that arrived inside the form (no JavaScript). */
export async function saveUpload(file: File, kind: UploadKind): Promise<StoredFile | { error: string }> {
  const problem = checkUpload(kind, file.name, file.size);
  if (problem) return { error: problem };
  const id = `${randomUUID()}.${extensionOf(file.name)}`;
  return finalise(id, file.name, kind, Buffer.from(await file.arrayBuffer()), "direct");
}

export const isFile = (v: FormDataEntryValue | null): v is File => typeof v === "object" && v !== null && "arrayBuffer" in v && v.size > 0;

/** True when the form carries a file or a receipt for this field. */
export function hasUpload(form: FormData, field: string) {
  const v = form.get(field);
  return isFile(v) || (typeof v === "string" && v.startsWith(RECEIPT_PREFIX)) || !!form.get(uploadErrorField(field));
}

/**
 * The one call forms use: returns the stored file, an error to show beside
 * the field, or undefined when nothing was uploaded.
 */
export async function takeUpload(form: FormData, field: string, kind: UploadKind): Promise<StoredFile | { error: string } | undefined> {
  const clientError = form.get(uploadErrorField(field));
  if (typeof clientError === "string" && clientError) return { error: clientError.slice(0, 200) };
  const v = form.get(field);
  if (typeof v === "string" && v.startsWith(RECEIPT_PREFIX)) return claimReceipt(v, kind);
  if (isFile(v)) return saveUpload(v, kind);
  return undefined;
}
