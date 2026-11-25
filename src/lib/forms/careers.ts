"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import {
  applicationSchema,
  equalitySchema,
  jobAlertSchema,
  referralSchema,
  talentPoolSchema,
} from "@/components/careers/schema";
import { siteUrl } from "@/lib/cms";
import { inbox, sendEmail, signature } from "./email";
import { logEvent } from "./log";
import { isSpam } from "./spam";
import { addMonths, nextReference, store } from "./store";
import type { FormState } from "./types";
import { uploadErrorField } from "./upload-rules";
import { hasUpload, takeUpload, type StoredFile } from "./uploads";
import { formToObject, zodErrors } from "./validate";

/* FM-04 Job application, CR-09 talent pool, CR-05 job alerts.
   Retention (section 9): unsuccessful applicants 6 months; talent pool 12 months unless renewed. */

const token = () => randomBytes(24).toString("base64url");

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

const spamReply: FormState = { status: "success", message: "Thank you. Your form has been received." };

const STAGE_TEXT = `What happens next
1. Received: we have your application (this email).
2. Shortlisted: we email you if you are shortlisted for a short phone call.
3. Interview: we invite you to an interview or a site visit.
4. Outcome: we email you with our decision.
We reply to every applicant within 10 working days.`;

export async function submitApplication(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) {
    await logEvent("spam_blocked", { form: "FM-04" });
    return spamReply;
  }
  const parsed = applicationSchema.safeParse(values);
  const errors = parsed.success ? {} : zodErrors(parsed.error);

  let cv: StoredFile | undefined;
  if (values.applyRoute === "cv") {
    if (!hasUpload(form, "cv")) errors.cv = "Upload your CV, or choose 'Apply without a CV'";
    else if (parsed.success && !Object.keys(errors).length) {
      // Claimed only once everything else is valid (unclaimed uploads expire in a day).
      const saved = await takeUpload(form, "cv", "cv");
      if (saved && "error" in saved) errors.cv = saved.error;
      else cv = saved;
    } else {
      const uploadError = form.get(uploadErrorField("cv"));
      if (typeof uploadError === "string" && uploadError) errors.cv = uploadError.slice(0, 200);
    }
  }
  if (!parsed.success || Object.keys(errors).length) return { status: "error", errors, values };

  const d = parsed.data;
  const referral = referralSchema.safeParse(values);
  const equality = equalitySchema.safeParse(values);
  const now = new Date();
  try {
    const ref = await nextReference("APP");
    const expiresAt = addMonths(now, 6);
    const { consent: _c, ...app } = d;
    void _c;
    await store().insert(
      "application",
      { form: "FM-04", ...app, cv: d.applyRoute === "cv" ? cv : undefined, status: "received", consentAt: now.toISOString() },
      { ref, expiresAt },
    );
    // Voluntary scheme data: kept apart, linked only by reference, never used for shortlisting.
    if (referral.success && (referral.data.heardFrom || referral.data.workCoach)) {
      await store().insert("referral", { applicationRef: ref, ...referral.data }, { expiresAt });
    }
    // Equality monitoring: no link to the applicant at all; anonymised reports only.
    if (equality.success && Object.values(equality.data).some(Boolean)) {
      await store().insert(
        "equality",
        { vacancySlug: d.vacancySlug ?? "general", month: now.toISOString().slice(0, 7), ...equality.data },
        { expiresAt: addMonths(now, 24) },
      );
    }
    await logEvent("form_submitted", { form: "FM-04", ref, route: d.applyRoute });

    await Promise.all([
      sendEmail(
        {
          to: d.email,
          subject: `We have your application: ${ref}`,
          text: `Dear ${d.name},\n\nThank you for applying for ${d.role}. Your reference number is ${ref}.\n\n${STAGE_TEXT}\n\nIf you need any adjustments for an interview, reply to this email and tell us.${signature}`,
        },
        "FM-04 acknowledgement",
      ),
      sendEmail(
        {
          to: inbox.people(),
          subject: `[${ref}] New application: ${d.role}`,
          text: [
            `Reference: ${ref}`,
            `Role: ${d.role}`,
            d.vacancySlug && !d.vacancySlug.startsWith("general") && `Vacancy: ${siteUrl()}/careers/vacancies/${d.vacancySlug}`,
            `Name: ${d.name}`,
            `Email: ${d.email}`,
            `Phone: ${d.phone}`,
            `Right to work in the UK: ${d.rightToWork}`,
            d.degree && `Degree: ${d.degree}`,
            d.graduationDate && `Graduation date: ${d.graduationDate}`,
            d.applyRoute === "cv" && cv
              ? `CV: ${cv.name} (stored privately, id ${cv.id}, scan ${cv.scan})`
              : `Applied without a CV.\n\nAbout them:\n${d.aboutYou}\n\nWork or volunteering:\n${d.experience ?? "-"}\n\nWhy construction:\n${d.whyConstruction}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        "FM-04 owner alert",
      ),
    ]);
    return { status: "success", ref };
  } catch (err) {
    await logEvent("form_failed", { form: "FM-04", context: "FM-04", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not send your application. Please try again." };
  }
}

export async function submitTalentPool(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form, ["routes", "areas"]);
  if (await isSpam(form, await clientIp())) return spamReply;
  const parsed = talentPoolSchema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: zodErrors(parsed.error), values };
  const { consent: _c, ...d } = parsed.data;
  void _c;
  try {
    const ref = await nextReference("TAL");
    const renewToken = token();
    const now = new Date();
    await store().insert("talent_pool", { ...d, renewToken, consentAt: now.toISOString() }, { ref, expiresAt: addMonths(now, 12) });
    await logEvent("form_submitted", { form: "CR-09", ref });
    await Promise.all([
      sendEmail(
        {
          to: d.email,
          subject: `You are in our talent pool: ${ref}`,
          text: `Dear ${d.name},\n\nThank you for registering your interest. Your reference is ${ref}.\n\nWe will contact you when a role opens that matches what you chose. We keep your details for 12 months. To keep them for another 12 months, use this link at any time:\n${siteUrl()}/careers/talent-pool/renew?token=${renewToken}\n\nIf you do nothing, we delete your details after 12 months.${signature}`,
        },
        "CR-09 acknowledgement",
      ),
      sendEmail(
        { to: inbox.people(), subject: `[${ref}] Talent pool registration`, text: `Reference: ${ref}\nRoutes: ${d.routes.join(", ")}\nAreas: ${d.areas.join(", ")}\nLocation: ${d.location ?? "-"}` },
        "CR-09 owner alert",
      ),
    ]);
    return { status: "success", ref };
  } catch (err) {
    await logEvent("form_failed", { form: "CR-09", context: "CR-09", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not save your details. Please try again." };
  }
}

export async function renewTalentPool(_prev: FormState, form: FormData): Promise<FormState> {
  const t = String(form.get("token") ?? "");
  if (!t) return { status: "error", message: "This link is not complete. Copy the whole link from your email." };
  const rec = (await store().list<{ renewToken: string }>("talent_pool")).find((r) => r.data.renewToken === t);
  if (!rec) return { status: "error", message: "We could not find your details. They may already have been deleted. You can register again." };
  await store().update("talent_pool", rec.id, rec.data, { expiresAt: addMonths(new Date(), 12) });
  await logEvent("talent_pool_renewed", { ref: rec.ref ?? "" });
  return { status: "success", message: "Thank you. We will keep your details for another 12 months." };
}

export async function submitJobAlert(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form, ["routes"]);
  if (await isSpam(form, await clientIp())) return spamReply;
  const parsed = jobAlertSchema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: zodErrors(parsed.error), values };
  const { email, routes } = parsed.data;
  try {
    const unsubscribeToken = token();
    await store().insert("job_alert", { email, routes, unsubscribeToken, consentAt: new Date().toISOString() });
    await logEvent("form_submitted", { form: "CR-05 alert" });
    await sendEmail(
      {
        to: email,
        subject: "Job alerts from Nseya Groupe Construction",
        text: `You will get an email when we open a new role of the type you chose.\n\nTo stop these emails at any time:\n${siteUrl()}/careers/alerts/unsubscribe?token=${unsubscribeToken}${signature}`,
      },
      "CR-05 alert confirmation",
    );
    return { status: "success", message: "Done. We will email you when a matching role opens." };
  } catch (err) {
    await logEvent("form_failed", { form: "CR-05", context: "CR-05", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not set up your alert. Please try again." };
  }
}

export async function unsubscribeJobAlert(_prev: FormState, form: FormData): Promise<FormState> {
  const t = String(form.get("token") ?? "");
  const rec = t ? (await store().list<{ unsubscribeToken: string }>("job_alert")).find((r) => r.data.unsubscribeToken === t) : undefined;
  if (rec) {
    await store().remove("job_alert", rec.id);
    await logEvent("job_alert_unsubscribed", {});
  }
  // Same answer either way, so the link cannot be used to test addresses.
  return { status: "success", message: "You will not get any more job alerts from us." };
}
