"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { siteUrl } from "@/lib/cms";
import { docTypeLabels, statusLabels } from "@/lib/suppliers/catalogue";
import { automaticChecks } from "@/lib/suppliers/checks";
import { lookupCompany } from "@/lib/suppliers/companiesHouse";
import { clearSupplierSession, hashToken, newToken, setSupplierSession } from "@/lib/suppliers/auth";
import { getSignedInSupplier, loadDraft } from "@/lib/suppliers/data";
import type { SupplierDoc, SupplierDraftData, SupplierRecord } from "@/lib/suppliers/model";
import { businessTypeLabel, isRegisteredBusiness } from "@/lib/suppliers/catalogue";
import { daysUntil, expiredDocs, normaliseCompanyNumber, skipsHealthAndSafety } from "@/lib/suppliers/rules";
import { inbox, sendEmail, signature } from "./email";
import { logEvent } from "./log";
import { isSpam } from "./spam";
import { nextReference, store } from "./store";
import type { FieldErrors, FormState } from "./types";
import { isFile, saveUpload } from "./uploads";
import { consent, email, formToObject, phone, req, zodErrors } from "./validate";

/*
 * FM-03 Supplier and subcontractor registration (SC-02) and the supplier
 * account (SC-03).
 *
 * Retention (section 9): supplier records are kept while active plus 6 years.
 * Active records carry expiresAt = null; when a supplier is closed or not
 * approved, the supply-chain coordinator sets expiresAt to closure + 6 years
 * and the daily job deletes it after that. Drafts expire after 30 days.
 * Bank details are never collected here (section 5b).
 */

const DRAFT_DAYS = 30;
const LOGIN_MINUTES = 15;

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/* ---------------- Start ---------------- */

const startSchema = z.object({ email, consent });

export async function startApplication(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) return { status: "success", message: "Check your email for a link to continue." };
  const parsed = startSchema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: zodErrors(parsed.error), values };
  const { token, hash } = newToken();
  try {
    await store().insert<SupplierDraftData>(
      "supplier_draft",
      { email: parsed.data.email, step: 1, documents: [] },
      { ref: hash, expiresAt: new Date(Date.now() + DRAFT_DAYS * 86400_000) },
    );
    await sendEmail(
      {
        to: parsed.data.email,
        subject: "Your supplier application: link to continue",
        text: `Thank you for starting your supplier application with Nseya Groupe Construction.\n\nYour progress is saved after each step. To continue at any time in the next ${DRAFT_DAYS} days, use this link:\n\n${siteUrl()}/suppliers/apply?resume=${token}\n\nKeep this link private: anyone with it can see and change your application.${signature}`,
      },
      "FM-03 resume link",
    );
    await logEvent("supplier_draft_started", { form: "FM-03" });
  } catch (err) {
    await logEvent("form_failed", { form: "FM-03", context: "FM-03 start", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not start your application. Please try again." };
  }
  redirect(`/suppliers/apply?resume=${token}`);
}

/* ---------------- Step helpers ---------------- */

const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date, like 2027-03-31");
const futureDate = (label: string) =>
  isoDate.refine((v) => daysUntil(v) >= 0, `The ${label} expiry date must be in the future. Upload a current certificate.`);
const arr = (min: number, message: string) => z.array(z.string().max(200)).min(min, message);

const parseMoney = (v: unknown) => {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const n = Number(v.replace(/[£,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const money = (label: string) =>
  z.preprocess(parseMoney, z.number({ error: `Enter the ${label} limit in pounds, like 10000000` }).positive(`Enter the ${label} limit in pounds`).max(1e10));

function putDoc(docs: SupplierDoc[], doc: SupplierDoc) {
  return [...docs.filter((d) => d.type !== doc.type), doc];
}

async function handleUpload(form: FormData, field: string, type: string, expiry: string | undefined, errors: FieldErrors): Promise<SupplierDoc | undefined> {
  const file = form.get(field);
  if (!isFile(file)) return undefined;
  const saved = await saveUpload(file, "document");
  if ("error" in saved) {
    errors[field] = saved.error;
    return undefined;
  }
  return { id: randomUUID(), type, label: docTypeLabels[type] ?? type, expiry, file: saved, uploadedAt: new Date().toISOString() };
}

const has = (docs: SupplierDoc[], type: string) => docs.some((d) => d.type === type && !d.superseded);

/* ---------------- Steps 1-5 ---------------- */

const step1 = z.object({
  businessType: z.enum(["limited", "llp", "sole-trader", "partnership"], { error: "Choose what type of business you are" }),
  legalName: req("your business name", 200),
  companyNumber: z.string().trim().max(12).optional().default(""),
  registeredAddress: req("your business address", 400),
  vatNumber: z.string().trim().regex(/^((GB)?\s?\d{3}\s?\d{4}\s?\d{2}(\d{3})?)?$/i, "Enter a VAT number, like GB123456789").optional().transform((v) => v || undefined),
  yearsTrading: z.enum(["under-1", "1-2", "3-5", "6-10", "over-10"], { error: "Choose how long you have been trading" }),
  size: z.enum(["sole", "micro", "small", "medium", "large"], { error: "Choose the size of your business" }),
  contactName: req("the contact person's name", 120),
  contactRole: z.string().trim().max(120).optional().transform((v) => v || undefined),
  phone: phone(true),
  regions: arr(1, "Choose at least one region you cover"),
}).transform((d, ctx) => {
  if (!isRegisteredBusiness(d.businessType)) return { ...d, companyNumber: "" };
  const n = d.companyNumber ? normaliseCompanyNumber(d.companyNumber) : null;
  if (!d.companyNumber) ctx.addIssue({ code: "custom", path: ["companyNumber"], message: "Enter your company number" });
  else if (!n) ctx.addIssue({ code: "custom", path: ["companyNumber"], message: "Enter an 8-character company number, like 12345678 or SC123456" });
  return { ...d, companyNumber: n ?? d.companyNumber };
});

const step2 = z
  .object({
    categories: arr(1, "Choose at least one category"),
    trades: z.array(z.string().max(200)),
    otherTrades: z.string().trim().max(500).optional().transform((v) => v || undefined),
    jobSize: z.enum(["under-25k", "25k-100k", "100k-500k", "over-500k"], { error: "Choose your typical job size" }),
    capacityPeople: z.string().trim().max(200).optional().transform((v) => v || undefined),
    capacityPlant: z.string().trim().max(500).optional().transform((v) => v || undefined),
    capabilities: z.array(z.string().max(100)),
  })
  .refine((d) => d.trades.length > 0 || !!d.otherTrades, { path: ["trades"], message: "Choose at least one trade, or describe your trade under 'Other trades'" });

export async function saveStep(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("resume") ?? "");
  const step = Number(form.get("step"));
  const intent = String(form.get("intent") ?? "next");
  const rec = await loadDraft(token);
  if (!rec) return { status: "error", message: "This application link has expired or is not valid. Please start again." };
  const draft = rec.data;

  if (intent === "back") {
    await store().update("supplier_draft", rec.id, { ...draft, step: Math.max(1, step - 1) });
    redirect(`/suppliers/apply?resume=${token}`);
  }

  const values = formToObject(form, ["regions", "categories", "trades", "capabilities", "ssipSchemes", "iso", "other"]);
  const errors: FieldErrors = {};
  let docs = draft.documents;
  let next: SupplierDraftData = draft;

  if (step === 1) {
    const p = step1.safeParse(values);
    if (!p.success) return { status: "error", errors: zodErrors(p.error), values };
    next = { ...draft, company: { ...p.data, phone: p.data.phone ?? "", companiesHouseStatus: draft.company?.companiesHouseStatus } };
  } else if (step === 2) {
    const p = step2.safeParse(values);
    if (!p.success) return { status: "error", errors: zodErrors(p.error), values };
    next = { ...draft, work: p.data };
  } else if (step === 3) {
    const ssipSchemes = (values.ssipSchemes as string[]).filter(Boolean);
    const cl = String(values.constructionline || "none");
    const schema = z.object({
      ssipExpiry: ssipSchemes.length ? futureDate("SSIP certificate") : z.string().optional(),
      constructionline: z.enum(["none", "bronze", "silver", "gold", "platinum"], { error: "Choose your Constructionline level" }),
      constructionlineExpiry: cl !== "none" ? futureDate("Constructionline") : z.string().optional(),
      iso: z.array(z.string()),
      other: z.array(z.string()),
      cscs: z.string().trim().max(300).optional().transform((v) => v || undefined),
    });
    const p = schema.safeParse(values);
    if (!p.success) Object.assign(errors, zodErrors(p.error));
    const d = p.success ? p.data : undefined;
    if (ssipSchemes.length) {
      const doc = await handleUpload(form, "ssipCert", "ssip-cert", d?.ssipExpiry, errors);
      if (doc) docs = putDoc(docs, doc);
      else if (!has(docs, "ssip-cert") && !errors.ssipCert) errors.ssipCert = "Upload your SSIP certificate";
      else if (!doc && d?.ssipExpiry) docs = docs.map((x) => (x.type === "ssip-cert" ? { ...x, expiry: d.ssipExpiry } : x));
    } else docs = docs.filter((x) => x.type !== "ssip-cert");
    if (cl !== "none") {
      const doc = await handleUpload(form, "constructionlineCert", "constructionline-cert", d?.constructionlineExpiry, errors);
      if (doc) docs = putDoc(docs, doc);
      else if (!has(docs, "constructionline-cert") && !errors.constructionlineCert) errors.constructionlineCert = "Upload your Constructionline certificate";
      else if (!doc && d?.constructionlineExpiry) docs = docs.map((x) => (x.type === "constructionline-cert" ? { ...x, expiry: d.constructionlineExpiry } : x));
    } else docs = docs.filter((x) => x.type !== "constructionline-cert");
    if (Object.keys(errors).length || !d) return { status: "error", errors, values };
    next = {
      ...draft,
      documents: docs,
      accreditations: {
        ssipSchemes,
        ssipExpiry: ssipSchemes.length ? d.ssipExpiry : undefined,
        constructionline: d.constructionline,
        constructionlineExpiry: cl !== "none" ? d.constructionlineExpiry : undefined,
        iso: d.iso,
        other: d.other,
        cscs: d.cscs,
      },
    };
  } else if (step === 4) {
    const designer = !!draft.work && (draft.work.capabilities.includes("design") || draft.work.categories.includes("consultants"));
    const insurance: SupplierDraftData["insurance"] = {};
    const covers = [
      { key: "el", label: "employer's liability", required: true },
      { key: "pl", label: "public liability", required: true },
      { key: "pi", label: "professional indemnity", required: designer },
      { key: "cw", label: "contract works", required: false },
    ] as const;
    for (const c of covers) {
      const limitRaw = String(values[`${c.key}Limit`] ?? "");
      const expiryRaw = String(values[`${c.key}Expiry`] ?? "");
      const given = limitRaw.trim() || expiryRaw.trim() || isFile(form.get(`${c.key}Cert`));
      if (!c.required && !given) {
        docs = docs.filter((x) => x.type !== c.key);
        continue;
      }
      const lp = money(c.label).safeParse(limitRaw);
      if (!lp.success) errors[`${c.key}Limit`] = lp.error.issues[0].message;
      const ep = futureDate(c.label).safeParse(expiryRaw);
      if (!ep.success) errors[`${c.key}Expiry`] = expiryRaw ? ep.error.issues[0].message : `Enter the ${c.label} expiry date`;
      const doc = await handleUpload(form, `${c.key}Cert`, c.key, ep.success ? ep.data : undefined, errors);
      if (doc) docs = putDoc(docs, doc);
      else if (!has(docs, c.key) && !errors[`${c.key}Cert`]) errors[`${c.key}Cert`] = `Upload your ${c.label} certificate`;
      else if (!doc && ep.success) docs = docs.map((x) => (x.type === c.key ? { ...x, expiry: ep.data } : x));
      insurance[c.key] = { limit: lp.success ? lp.data : undefined, expiry: ep.success ? ep.data : undefined };
    }
    if (Object.keys(errors).length) return { status: "error", errors, values };
    next = { ...draft, documents: docs, insurance };
  } else if (step === 5) {
    const skip = skipsHealthAndSafety(draft.accreditations ?? {});
    const schema = z.object({
      modernSlavery: z.literal("yes", { error: "Confirm the modern slavery declaration" }),
      antiBribery: z.literal("yes", { error: "Confirm the anti-bribery declaration" }),
      supplierCode: z.literal("yes", { error: "Accept the supplier code to continue" }),
      platformRule: z.literal("yes", { error: "Accept the platform rule to continue" }),
      cis: z.enum(["gross", "net", "not-registered", "not-applicable"], { error: "Choose your CIS status" }),
    });
    const p = schema.safeParse(values);
    if (!p.success) Object.assign(errors, zodErrors(p.error));
    for (const t of ["hs-policy", "quality-policy", "env-policy", "equality-policy"]) {
      const field = t.replace(/-(\w)/g, (_m, c: string) => c.toUpperCase());
      const doc = await handleUpload(form, field, t, undefined, errors);
      if (doc) docs = putDoc(docs, doc);
    }
    if (!skip.skip && !has(docs, "hs-policy") && !errors.hsPolicy) {
      errors.hsPolicy = "Upload your health and safety policy, or go back and add a valid SSIP certificate or Constructionline Gold";
    }
    if (Object.keys(errors).length || !p.success) return { status: "error", errors, values };
    next = {
      ...draft,
      documents: docs,
      policies: {
        hsMethod: skip.skip ? "accreditation" : "upload",
        modernSlavery: true,
        antiBribery: true,
        supplierCode: true,
        platformRule: true,
        cis: p.data.cis,
      },
    };
  } else {
    return { status: "error", message: "Unknown step." };
  }

  await store().update("supplier_draft", rec.id, { ...next, step: Math.min(6, step + 1) });
  redirect(`/suppliers/apply?resume=${token}`);
}

/* ---------------- Step 6: submit ---------------- */

const submitSchema = z.object({
  consent,
  truthful: z.literal("yes", { error: "Confirm that the information you have given is true" }),
});

export async function submitApplication(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("resume") ?? "");
  const rec = await loadDraft(token);
  if (!rec) return { status: "error", message: "This application link has expired or is not valid. Please start again." };
  if (await isSpam(form, await clientIp())) return { status: "success", message: "Thank you." };
  const values = formToObject(form);
  const p = submitSchema.safeParse(values);
  if (!p.success) return { status: "error", errors: zodErrors(p.error), values };
  const d = rec.data;
  if (!d.company || !d.work || !d.accreditations || !d.insurance || !d.policies) {
    return { status: "error", message: "Some steps are not complete. Use Back to finish them." };
  }

  let ref: string;
  try {
    const registered = isRegisteredBusiness(d.company.businessType);
    const ch = registered ? await lookupCompany(d.company.companyNumber) : null;
    const chStatus = !registered ? "not-applicable" : ch === null ? null : ch === "not-found" ? "not found" : ch.status;
    const now = new Date();
    const base = {
      email: d.email,
      company: { ...d.company, companiesHouseStatus: chStatus ?? undefined },
      work: d.work,
      accreditations: d.accreditations,
      insurance: d.insurance,
      policies: d.policies,
      documents: d.documents,
    };
    const record: SupplierRecord = {
      ...base,
      status: "applied",
      suspended: expiredDocs(d.documents, now).length > 0,
      checks: automaticChecks(base, chStatus, now),
      prequalificationTask: "open",
      remindersSent: [],
      submittedAt: now.toISOString(),
      declaration: { truthful: true, consent: true, at: now.toISOString() },
    };
    ref = await nextReference("SUP");
    // Active supplier record: no expiry (kept while active, then 6 years; see header).
    await store().insert("supplier", record, { ref, expiresAt: null });
    await store().remove("supplier_draft", rec.id);
    await logEvent("form_submitted", { form: "FM-03", ref });

    const failed = record.checks.filter((c) => c.result !== "pass");
    await Promise.all([
      sendEmail(
        {
          to: d.email,
          subject: `Supplier application received: ${ref}`,
          text: `Dear ${d.company.contactName},\n\nThank you for applying to join the Nseya Groupe Construction supply chain. Your reference number is ${ref}.\n\nStatus: ${statusLabels.applied}.\n\nWhat happens next: our supply-chain coordinator checks your evidence and references, normally within 10 working days, and emails you the decision with the reason. You can see your status and keep your documents up to date at ${siteUrl()}/suppliers/account.\n\nWe never ask for bank details by email. After approval we request them through your signed-in supplier account and confirm them by phone on a number we already hold.${signature}`,
        },
        "FM-03 acknowledgement",
      ),
      sendEmail(
        {
          to: inbox.supplyChain(),
          replyTo: d.email,
          subject: `[${ref}] New supplier application: ${d.company.legalName}`,
          text: [
            `Reference: ${ref}`,
            `Business: ${d.company.legalName} (${d.company.companyNumber || businessTypeLabel(d.company.businessType)})`,
            `Companies House: ${chStatus ?? "not checked"}`,
            `Categories: ${d.work.categories.join(", ")}`,
            `Regions: ${d.company.regions.join(", ")}`,
            "",
            "Automatic checks:",
            ...record.checks.map((c) => `- ${c.check}: ${c.result.toUpperCase()} (${c.detail})`),
            "",
            failed.length ? `${failed.length} check(s) need attention.` : "All automatic checks passed.",
            "Prequalification task: open. Target decision: 10 working days.",
          ].join("\n"),
        },
        "FM-03 owner alert",
      ),
    ]);
  } catch (err) {
    await logEvent("form_failed", { form: "FM-03", context: "FM-03 submit", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
    return { status: "error", values, message: "Sorry, we could not submit your application. Your answers are saved; please try again." };
  }
  redirect(`/suppliers/apply/submitted?ref=${encodeURIComponent(ref)}`);
}

/* ---------------- SC-03: one-time link sign-in ---------------- */

const SENT_MESSAGE = "If that email address is registered with us, we have sent a sign-in link to it. The link works once and expires in 15 minutes.";

async function findSupplierByEmail(addr: string) {
  const all = await store().list<SupplierRecord>("supplier");
  return all.find((r) => r.data.email.toLowerCase() === addr.toLowerCase()) ?? null;
}

export async function requestLogin(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form, await clientIp())) return { status: "success", message: SENT_MESSAGE };
  const p = z.object({ email }).safeParse(values);
  if (!p.success) return { status: "error", errors: zodErrors(p.error), values };
  try {
    const supplier = await findSupplierByEmail(p.data.email);
    if (supplier) {
      const { token, hash } = newToken();
      await store().insert("login_token", { supplierId: supplier.id, used: false }, { ref: hash, expiresAt: new Date(Date.now() + LOGIN_MINUTES * 60_000) });
      await sendEmail(
        {
          to: supplier.data.email,
          subject: "Your sign-in link",
          text: `Use this link to sign in to your Nseya supplier account. It works once and expires in ${LOGIN_MINUTES} minutes.\n\n${siteUrl()}/suppliers/account/verify?token=${token}\n\nIf you did not ask for this, you can ignore this email.${signature}`,
        },
        "SC-03 sign-in link",
      );
    }
    await logEvent("supplier_login_requested", { matched: !!supplier });
  } catch (err) {
    await logEvent("form_failed", { form: "SC-03", context: "SC-03 login", error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
  }
  return { status: "success", message: SENT_MESSAGE };
}

/** Consumes the one-time token by POST (so email link scanners cannot use it up). */
export async function consumeLogin(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const rec = token ? await store().findByRef<{ supplierId: string; used: boolean }>("login_token", hashToken(token)) : null;
  if (!rec || rec.data.used || !rec.expiresAt || new Date(rec.expiresAt) < new Date()) {
    return { status: "error", message: "This sign-in link has expired or has already been used. Ask for a new link below." };
  }
  await store().remove("login_token", rec.id);
  await setSupplierSession(rec.data.supplierId);
  await logEvent("supplier_signed_in", { ok: true });
  redirect("/suppliers/account");
}

export async function signOut() {
  await clearSupplierSession();
  redirect("/suppliers/account");
}

/* ---------------- SC-03: replace a document ---------------- */

export async function uploadRenewal(_prev: FormState, form: FormData): Promise<FormState> {
  const rec = await getSignedInSupplier();
  if (!rec) return { status: "error", message: "Your session has ended. Please sign in again." };
  const values = formToObject(form);
  const types = Object.keys(docTypeLabels);
  const insuranceTypes = ["el", "pl", "pi", "cw"];
  const type = String(values.docType ?? "");
  const errors: FieldErrors = {};
  if (!types.includes(type)) errors.docType = "Choose which document you are uploading";
  const needsExpiry = !type.endsWith("-policy");
  let expiry: string | undefined;
  if (needsExpiry) {
    const e = futureDate("new").safeParse(String(values.expiry ?? ""));
    if (!e.success) errors.expiry = values.expiry ? e.error.issues[0].message : "Enter the new expiry date";
    else expiry = e.data;
  }
  let limit: number | undefined;
  if (insuranceTypes.includes(type) && String(values.limit ?? "").trim()) {
    const l = money("insurance").safeParse(String(values.limit));
    if (!l.success) errors.limit = l.error.issues[0].message;
    else limit = l.data;
  }
  if (Object.keys(errors).length) return { status: "error", errors, values };
  const doc = await handleUpload(form, "file", type, expiry, errors);
  if (!doc) return { status: "error", errors: { file: errors.file ?? "Choose the file to upload", ...errors }, values };

  const data = rec.data;
  const documents = [...data.documents.map((d) => (d.type === type && !d.superseded ? { ...d, superseded: true } : d)), doc];
  const insurance = { ...data.insurance };
  if (insuranceTypes.includes(type)) {
    const k = type as "el" | "pl" | "pi" | "cw";
    insurance[k] = { limit: limit ?? insurance[k]?.limit, expiry };
  }
  const accreditations = { ...data.accreditations };
  if (type === "ssip-cert") accreditations.ssipExpiry = expiry;
  if (type === "constructionline-cert") accreditations.constructionlineExpiry = expiry;
  const suspended = expiredDocs(documents).length > 0;
  await store().update<SupplierRecord>("supplier", rec.id, { ...data, documents, insurance, accreditations, suspended });
  await logEvent("supplier_document_renewed", { ref: rec.ref ?? "", type });
  await sendEmail(
    {
      to: inbox.supplyChain(),
      subject: `[${rec.ref}] Document renewed: ${docTypeLabels[type]}`,
      text: `${data.company.legalName} uploaded a renewed ${docTypeLabels[type]}${expiry ? `, expiring ${expiry}` : ""}${limit ? `, limit £${limit.toLocaleString("en-GB")}` : ""}.\nFile scan status: ${doc.file.scan}.${data.suspended && !suspended ? "\nNo documents are now expired: the supplier is no longer suspended from new awards." : ""}`,
    },
    "SC-03 renewal alert",
  );
  return { status: "success", message: `Thank you. Your ${docTypeLabels[type].toLowerCase()} has been updated.` };
}
