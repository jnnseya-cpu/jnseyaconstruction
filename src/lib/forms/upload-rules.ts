/**
 * Upload rules shared by the browser and the server (section 6, rule 3;
 * FM-01 attachment 20MB; FM-04 CV PDF/DOCX 10MB). The browser uses them for
 * instant feedback; the server enforces them again on the stored file.
 */
export type UploadKind = "cv" | "document" | "attachment";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const UPLOAD_LIMITS: Record<UploadKind, { maxBytes: number; types: Record<string, string> }> = {
  cv: { maxBytes: 10 * 1024 * 1024, types: { pdf: PDF, docx: DOCX } },
  document: { maxBytes: 10 * 1024 * 1024, types: { pdf: PDF, jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" } },
  attachment: { maxBytes: 20 * 1024 * 1024, types: { pdf: PDF, docx: DOCX, xlsx: XLSX, jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" } },
};

export const isUploadKind = (k: unknown): k is UploadKind => k === "cv" || k === "document" || k === "attachment";

export const extensionOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");

/** Content type we sign and store for a file, decided by its extension, never by the browser. */
export const contentTypeFor = (kind: UploadKind, name: string) => UPLOAD_LIMITS[kind].types[extensionOf(name)];

export function checkUpload(kind: UploadKind, name: string, size: number): string | null {
  const rule = UPLOAD_LIMITS[kind];
  if (!rule.types[extensionOf(name)]) return `The file must be ${[...new Set(Object.keys(rule.types).map((t) => (t === "jpeg" ? "jpg" : t)))].map((t) => t.toUpperCase()).join(", ")}`;
  if (size > rule.maxBytes) return `The file must be smaller than ${Math.round(rule.maxBytes / 1024 / 1024)}MB`;
  if (size <= 0) return "The file is empty";
  return null;
}

/** Name of the hidden field the browser sets when a direct upload failed before the form was sent. */
export const uploadErrorField = (field: string) => `${field}__upload_error`;
/** Prefix of an upload receipt sent in place of the file. */
export const RECEIPT_PREFIX = "upl.";
