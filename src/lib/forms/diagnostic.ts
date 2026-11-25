"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { projectTypeLabels, projectTypes, scoreDiagnostic } from "./diagnostic-options";
import { inbox, sendEmail, signature } from "./email";
import { logEvent } from "./log";
import { isSpam } from "./spam";
import { addYears, nextReference, store } from "./store";
import type { FormState } from "./types";
import { isFile, saveUpload, type StoredFile } from "./uploads";
import { consent, email, formToObject, oneOf, opt, phone, req, zodErrors } from "./validate";

/* FM-02 Site Systems Diagnostic request (ETABLIX). Owner: ETABLIX.
   Lead tagged "ETABLIX diagnostic"; best-fit score kept internally only. */

const intText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .regex(/^\d+$/, `Enter the ${label} as a whole number, like 120`)
    .transform(Number)
    .refine((n) => n >= min && n <= max, `The ${label} must be between ${min} and ${max}`);

const diagnosticSchema = z.object({
  name: req("your name", 120),
  organisation: req("your organisation", 160),
  email,
  message: req("a short description of the project", 5000),
  consent,
  phone: phone(false),
  projectType: oneOf(projectTypes, "Choose the project type"),
  workforcePeak: intText("workforce peak", 1, 20000),
  location: req("the project location", 160),
  programmeMonths: intText("programme length in months", 1, 240),
  remoteSite: z.enum(["yes", "no", "unsure"]).optional().or(z.literal("")).transform((v) => v || undefined),
  tradesNeeded: opt(500),
  budget: opt(40),
  startDate: opt(40),
  sourcePage: opt(200),
});

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function submitDiagnostic(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) {
    await logEvent("spam_blocked", { form: "FM-02" });
    return { status: "success", message: "Thank you. Your request has been received." };
  }
  const parsed = diagnosticSchema.safeParse(values);
  const errors = parsed.success ? {} : zodErrors(parsed.error);

  let attachment: StoredFile | undefined;
  const file = form.get("attachment");
  if (isFile(file)) {
    const saved = await saveUpload(file, "attachment");
    if ("error" in saved) errors.attachment = saved.error;
    else attachment = saved;
  }
  if (!parsed.success || Object.keys(errors).length) return { status: "error", errors, values };

  const d = parsed.data;
  try {
    const ref = await nextReference("DIA");
    const fit = scoreDiagnostic(d);
    await store().insert(
      "diagnostic",
      { form: "FM-02", tag: "ETABLIX diagnostic", ...d, company: "etablix", attachment, bestFit: fit, status: "new", crm: "pending" },
      { ref, expiresAt: addYears(new Date(), 2) },
    );
    await logEvent("form_submitted", { form: "FM-02", ref, score: fit.score });

    await Promise.all([
      sendEmail(
        {
          to: d.email,
          subject: `We have your Site Systems Diagnostic request: ${ref}`,
          text: `Dear ${d.name},\n\nThank you for asking ETABLIX for a Site Systems Diagnostic call. Your reference number is ${ref}.\n\nWe reply within one working day to arrange a time.${
            process.env.NEXT_PUBLIC_BOOKING_URL ? `\n\nYou can also choose a time now: ${process.env.NEXT_PUBLIC_BOOKING_URL}` : ""
          }${signature}`,
        },
        "FM-02 acknowledgement",
      ),
      sendEmail(
        {
          to: inbox.etablix(),
          replyTo: d.email,
          subject: `[${ref}] ETABLIX diagnostic: ${projectTypeLabels[d.projectType]}, peak ${d.workforcePeak}, fit ${fit.score}/6`,
          text: [
            `Reference: ${ref}`,
            `Tag: ETABLIX diagnostic`,
            `Best-fit score (provisional criteria): ${fit.score}/6`,
            ...Object.entries(fit.criteria).map(([k, v]) => `  ${v ? "[x]" : "[ ]"} ${k}`),
            `Name: ${d.name}`,
            `Organisation: ${d.organisation}`,
            `Email: ${d.email}`,
            d.phone && `Phone: ${d.phone}`,
            `Project type: ${projectTypeLabels[d.projectType]}`,
            `Workforce peak: ${d.workforcePeak}`,
            `Programme length: ${d.programmeMonths} months`,
            `Location: ${d.location}`,
            d.remoteSite && `Remote or greenfield site: ${d.remoteSite}`,
            d.tradesNeeded && `Services needed: ${d.tradesNeeded}`,
            d.startDate && `Start date: ${d.startDate}`,
            attachment && `Attachment: ${attachment.name} (stored privately, id ${attachment.id}, scan ${attachment.scan})`,
            "",
            d.message,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        "FM-02 owner alert",
      ),
    ]);
    return { status: "success", ref };
  } catch (err) {
    await logEvent("form_failed", { form: "FM-02", context: "FM-02", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not send your request. Please try again, or use the enquiry form on the contact page." };
  }
}
