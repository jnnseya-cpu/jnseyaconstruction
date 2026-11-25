"use server";

import { logEvent } from "./log";
import { isUploadKind } from "./upload-rules";
import { createTicket } from "./uploads";

/**
 * Issues a signed upload URL for one file. Called by the browser just before
 * a form is sent. The ticket only allows a PUT of that exact size and type
 * into incoming/, which is emptied after a day unless a form claims it.
 */
export async function requestUpload(kind: string, name: string, size: number): Promise<{ receipt: string; url: string; contentType: string } | { error: string }> {
  if (!isUploadKind(kind) || typeof name !== "string" || typeof size !== "number" || !Number.isFinite(size)) {
    return { error: "This file cannot be uploaded" };
  }
  try {
    return await createTicket(kind, name, size);
  } catch (err) {
    await logEvent("upload_ticket_failed", { context: "uploads", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { error: "Uploads are not available just now. Please try again in a few minutes" };
  }
}
