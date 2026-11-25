import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Private file storage (section 6, rule 3). Files are never written under
 * /public and are never served on a public URL. In production UPLOAD_DIR
 * points at a mounted private Cloud Storage bucket (or replace saveUpload
 * with the GCS client).
 */

export type UploadKind = "cv" | "document" | "attachment";

const LIMITS: Record<UploadKind, { maxBytes: number; types: Record<string, string[]> }> = {
  cv: { maxBytes: 10 * 1024 * 1024, types: { pdf: ["application/pdf"], docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] } },
  document: {
    maxBytes: 10 * 1024 * 1024,
    types: { pdf: ["application/pdf"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"] },
  },
  attachment: {
    maxBytes: 20 * 1024 * 1024,
    types: {
      pdf: ["application/pdf"],
      docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
    },
  },
};

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  scan: "clean" | "pending";
}

/** Magic-byte check so a renamed executable is rejected. */
function signatureMatches(ext: string, buf: Buffer) {
  if (ext === "pdf") return buf.subarray(0, 5).toString("latin1") === "%PDF-";
  if (ext === "docx" || ext === "xlsx") return buf[0] === 0x50 && buf[1] === 0x4b;
  if (ext === "png") return buf.subarray(1, 4).toString("latin1") === "PNG";
  if (ext === "jpg" || ext === "jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  return false;
}

export function validateUpload(file: File, kind: UploadKind): string | null {
  const rule = LIMITS[kind];
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!rule.types[ext]) return `The file must be ${Object.keys(rule.types).map((t) => t.toUpperCase()).join(", ")}`;
  if (file.size > rule.maxBytes) return `The file must be smaller than ${Math.round(rule.maxBytes / 1024 / 1024)}MB`;
  if (file.size === 0) return "The file is empty";
  return null;
}

/**
 * Virus scan hook. Set CLAMAV_URL to a ClamAV REST scanner (e.g. a Cloud Run
 * clamav service) in production; files stay "pending" and are not opened by
 * staff until scanned clean.
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

export async function saveUpload(file: File, kind: UploadKind): Promise<StoredFile | { error: string }> {
  const problem = validateUpload(file, kind);
  if (problem) return { error: problem };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()!.toLowerCase();
  if (!signatureMatches(ext, buf)) return { error: "The file does not look like a real " + ext.toUpperCase() + " file" };
  const result = await scan(buf);
  if (result === "infected") return { error: "The file was rejected by our virus scanner" };
  const id = `${randomUUID()}.${ext}`;
  const dir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./storage/uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id), buf, { mode: 0o600 });
  return { id, name: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 120), size: file.size, type: ext, scan: result };
}

export const isFile = (v: FormDataEntryValue | null): v is File => typeof v === "object" && v !== null && "arrayBuffer" in v && v.size > 0;
