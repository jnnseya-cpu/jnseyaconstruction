"use client";

import { useActionState } from "react";
import { routeOptions } from "@/components/careers/schema";
import { submitJobAlert } from "@/lib/forms/careers";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, ErrorSummary, Honeypot, SubmitButton, TextField } from "./Fields";
import Link from "next/link";

/** CR-05 email alert sign-up. Every alert email carries an unsubscribe link. */
export function JobAlertForm() {
  const [state, action] = useActionState(submitJobAlert, initialFormState);
  if (state.status === "success") {
    return <div className="form-success" role="status"><p style={{ margin: 0 }}>{state.message}</p></div>;
  }
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
      <ChoiceGroup name="routes" label="Tell me about" required multiple columns state={state}
        options={routeOptions.map((o) => ({ value: o.value, label: o.label }))} />
      <div className="field">
        {state.errors?.consent && <p className="field-error" id="consent-error">{state.errors.consent}</p>}
        <label className="choice" htmlFor="alert-consent">
          <input type="checkbox" id="alert-consent" name="consent" value="yes" required />
          <span>Email me when a matching role opens. I can stop these emails at any time. Read our <Link href="/privacy">privacy notice</Link>.</span>
        </label>
      </div>
      <div><SubmitButton>Set up job alerts</SubmitButton></div>
    </form>
  );
}
