"use server";

import { z } from "zod";
import { siteUrl } from "@/lib/cms";
import { sendEmail, signature } from "./email";
import { logEvent } from "./log";
import { isSpam } from "./spam";
import { store } from "./store";
import { hashToken, newToken } from "./tokens";
import type { FormState } from "./types";
import { consent, email, formToObject, zodErrors } from "./validate";

/* FM-06 Newsletter sign-up: double opt-in; kept until unsubscribed (section 9). */

type Subscriber = { email: string; status: "pending" | "confirmed"; tokenHash: string; consentText: string; confirmedAt?: string };

const schema = z.object({ email, consent });

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  const values = formToObject(form);
  if (await isSpam(form)) return { status: "success" };
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: zodErrors(parsed.error), values };
  const addr = parsed.data.email.toLowerCase();
  const s = store();
  const existing = (await s.list<Subscriber>("newsletter")).find((r) => r.data.email === addr);
  const { token, hash } = newToken();
  const data: Subscriber = {
    email: addr,
    status: existing?.data.status === "confirmed" ? "confirmed" : "pending",
    tokenHash: hash,
    consentText: "Field notes from Nseya Group Construction, about once a month. Unsubscribe at any time.",
  };
  // Unconfirmed sign-ups are removed after 30 days.
  const pendingExpiry = new Date(Date.now() + 30 * 86400_000);
  if (existing) await s.update("newsletter", existing.id, { ...existing.data, tokenHash: hash }, existing.data.status === "pending" ? { expiresAt: pendingExpiry } : {});
  else await s.insert("newsletter", data, { expiresAt: pendingExpiry });
  await logEvent("form_submitted", { form: "FM-06" });
  if (data.status === "pending") {
    await sendEmail(
      {
        to: addr,
        subject: "Please confirm your subscription",
        text: `Please confirm you want field notes from Nseya Group Construction by opening this link:\n\n${siteUrl()}/newsletter/confirm?token=${token}\n\nIf you did not ask for this, ignore this email and we will delete your address within 30 days.${signature}`,
      },
      "FM-06 confirm",
    );
  }
  return { status: "success", message: "Check your inbox and open the link to confirm. Nothing is sent until you confirm." };
}

export async function confirmSubscription(token: string): Promise<boolean> {
  const s = store();
  const hash = hashToken(token);
  const rec = (await s.list<Subscriber>("newsletter")).find((r) => r.data.tokenHash === hash);
  if (!rec) return false;
  await s.update("newsletter", rec.id, { ...rec.data, status: "confirmed", confirmedAt: new Date().toISOString() }, { expiresAt: null });
  return true;
}

export async function unsubscribe(token: string): Promise<boolean> {
  const s = store();
  const hash = hashToken(token);
  const rec = (await s.list<Subscriber>("newsletter")).find((r) => r.data.tokenHash === hash);
  if (!rec) return false;
  await s.remove("newsletter", rec.id);
  await logEvent("newsletter_unsubscribed", { form: "FM-06" });
  return true;
}
