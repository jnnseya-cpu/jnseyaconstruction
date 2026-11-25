"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribe } from "@/lib/forms/newsletter";
import { initialFormState } from "@/lib/forms/types";
import { Honeypot, SubmitButton } from "./Fields";

/** FM-06, compact footer version. */
export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, initialFormState);
  if (state.status === "success") return <p role="status">{state.message ?? "Thank you."}</p>;
  const err = state.errors ?? {};
  return (
    <form action={action} noValidate className="newsletter">
      <Honeypot />
      <label htmlFor="nl-email">Email address for field notes</label>
      {err.email && <p className="field-error" id="nl-email-error">{err.email}</p>}
      <div className="newsletter__row">
        <input id="nl-email" name="email" type="email" autoComplete="email" required className="input" aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "nl-email-error" : undefined} />
        <SubmitButton pendingText="…">Sign up</SubmitButton>
      </div>
      {err.consent && <p className="field-error" id="nl-consent-error">{err.consent}</p>}
      <label className="newsletter__consent">
        <input type="checkbox" name="consent" value="yes" required aria-describedby={err.consent ? "nl-consent-error" : undefined} />
        <span>Send me field notes about once a month. See the <Link href="/privacy">privacy notice</Link>.</span>
      </label>
    </form>
  );
}
