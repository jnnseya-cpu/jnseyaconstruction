"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail, inbox, signature } from "./email";
import { logEvent } from "./log";
import { isSpam } from "./spam";
import { addYears, nextReference, store } from "./store";
import type { FormState } from "./types";
import { isFile, saveUpload, type StoredFile } from "./uploads";
import { consent, email, formToObject, oneOf, opt, phone, req, zodErrors } from "./validate";

/* FM-01 Project enquiry, FM-02 Site Systems Diagnostic, FM-05 General contact.
   Retention: enquiries 2 years (section 9). */

export const companyOptions = ["consultancy", "etablix", "construction", "not-sure"] as const;
export const enquiryTypes = [
  "project",
  "tender",
  "framework",
  "quote",
  "partnership",
  "other",
] as const;
export const enquiryTypeLabels: Record<(typeof enquiryTypes)[number], string> = {
  project: "A project I want to discuss",
  tender: "A tender or quotation request",
  framework: "A framework or dynamic purchasing system",
  quote: "A quote for home building work",
  partnership: "Partnership or joint venture",
  other: "Something else",
};
export const budgetBands = ["under-50k", "50k-250k", "250k-1m", "1m-5m", "over-5m", "unknown"] as const;

const enquirySchema = z.object({
  name: req("your name", 120),
  organisation: req("your organisation, or 'Private individual'", 160),
  email,
  company: oneOf(companyOptions, "Choose which company you want to talk to"),
  enquiryType: oneOf(enquiryTypes, "Choose the type of enquiry"),
  message: req("your message", 5000),
  consent,
  phone: phone(false),
  location: opt(160),
  budget: z.enum(budgetBands).optional().or(z.literal("")).transform((v) => v || undefined),
  startDate: opt(40),
  sourcePage: opt(200),
});

const companyName = { consultancy: "Nseya Consultancy", etablix: "ETABLIX", construction: "Nseya Construction", "not-sure": "Nseya Groupe Construction" };
const companyInbox = (c: (typeof companyOptions)[number]) =>
  c === "consultancy" ? inbox.consultancy() : c === "etablix" ? inbox.etablix() : c === "construction" ? inbox.construction() : inbox.group();

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function submitEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) {
    await logEvent("spam_blocked", { form: "FM-01" });
    // Same response as success without a reference, so bots learn nothing.
    return { status: "success", message: "Thank you. Your message has been received." };
  }
  const parsed = enquirySchema.safeParse(values);
  const errors = parsed.success ? {} : zodErrors(parsed.error);

  let attachment: StoredFile | undefined;
  const file = form.get("attachment");
  if (isFile(file)) {
    const saved = await saveUpload(file, "attachment");
    if ("error" in saved) errors.attachment = saved.error;
    else attachment = saved;
  }
  if (!parsed.success || Object.keys(errors).length) {
    return { status: "error", errors, values };
  }

  const d = parsed.data;
  try {
    const ref = await nextReference("ENQ");
    await store().insert(
      "enquiry",
      { form: "FM-01", ...d, attachment, status: "new", crm: "pending" },
      { ref, expiresAt: addYears(new Date(), 2) },
    );
    await logEvent("form_submitted", { form: "FM-01", ref, company: d.company });

    await Promise.all([
      sendEmail(
        {
          to: d.email,
          subject: `We have your enquiry: ${ref}`,
          text: `Dear ${d.name},\n\nThank you for contacting ${companyName[d.company]}. Your reference number is ${ref}.\n\nWe reply to every enquiry within one working day. If you need to add anything, reply to this email and keep the reference in the subject line.\n\nYour message:\n${d.message}${signature}`,
        },
        "FM-01 acknowledgement",
      ),
      sendEmail(
        {
          to: companyInbox(d.company),
          replyTo: d.email,
          subject: `[${ref}] New ${enquiryTypeLabels[d.enquiryType].toLowerCase()} for ${companyName[d.company]}`,
          text: [
            `Reference: ${ref}`,
            `Company wanted: ${companyName[d.company]}`,
            `Type: ${enquiryTypeLabels[d.enquiryType]}`,
            `Name: ${d.name}`,
            `Organisation: ${d.organisation}`,
            `Email: ${d.email}`,
            d.phone && `Phone: ${d.phone}`,
            d.location && `Location: ${d.location}`,
            d.budget && `Budget band: ${d.budget}`,
            d.startDate && `Start date: ${d.startDate}`,
            d.sourcePage && `Sent from page: ${d.sourcePage}`,
            attachment && `Attachment: ${attachment.name} (stored privately, id ${attachment.id}, scan ${attachment.scan})`,
            "",
            d.message,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        "FM-01 owner alert",
      ),
    ]);
    return { status: "success", ref };
  } catch (err) {
    await logEvent("form_failed", { form: "FM-01", context: "FM-01", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not send your enquiry. Please try again, or email us directly." };
  }
}

/* ---------- FM-05 General contact and press ---------- */

const contactSchema = z.object({ name: req("your name", 120), email, message: req("your message", 5000), consent });

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) return { status: "success", message: "Thank you. Your message has been received." };
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: zodErrors(parsed.error), values };
  const d = parsed.data;
  try {
    const ref = await nextReference("GEN");
    await store().insert("contact", { form: "FM-05", ...d }, { ref, expiresAt: addYears(new Date(), 2) });
    await logEvent("form_submitted", { form: "FM-05", ref });
    await Promise.all([
      sendEmail({ to: d.email, subject: `We have your message: ${ref}`, text: `Dear ${d.name},\n\nThank you for your message. Your reference number is ${ref}. We reply within one working day.${signature}` }, "FM-05 acknowledgement"),
      sendEmail({ to: inbox.group(), replyTo: d.email, subject: `[${ref}] General contact from ${d.name}`, text: `Reference: ${ref}\nName: ${d.name}\nEmail: ${d.email}\n\n${d.message}` }, "FM-05 owner alert"),
    ]);
    return { status: "success", ref };
  } catch (err) {
    await logEvent("form_failed", { form: "FM-05", context: "FM-05", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not send your message. Please try again." };
  }
}
