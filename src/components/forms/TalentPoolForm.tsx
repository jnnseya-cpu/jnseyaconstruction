"use client";

import { useActionState } from "react";
import { areaOptions, routeOptions } from "@/components/careers/schema";
import { submitTalentPool } from "@/lib/forms/careers";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, Consent, ErrorSummary, Honeypot, SubmitButton, Success, TextArea, TextField, Turnstile } from "./Fields";

/** CR-09 talent pool registration. */
export function TalentPoolForm() {
  const [state, action] = useActionState(submitTalentPool, initialFormState);
  if (state.status === "success") {
    return (
      <Success state={state} title="You are in our talent pool">
        <p>We will contact you when a matching role opens. We keep your details for 12 months, and email you a link to keep them for longer.</p>
      </Success>
    );
  }
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <TextField name="name" label="Your full name" required autoComplete="name" state={state} />
      <div className="form-row">
        <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" inputMode="tel" state={state} />
      </div>
      <TextField name="location" label="Where do you live?" hint="Town or first half of your postcode, for example B44" state={state} />
      <ChoiceGroup name="routes" label="Which routes interest you?" hint="Choose all that apply." required multiple columns state={state}
        options={routeOptions.map((o) => ({ value: o.value, label: o.label, hint: o.hint }))} />
      <ChoiceGroup name="areas" label="Which areas of work interest you?" hint="Choose all that apply. Not sure? Pick the ones that sound interesting." required multiple columns state={state}
        options={areaOptions.map((o) => ({ value: o.value, label: o.label }))} />
      <TextArea name="message" label="Anything else you want us to know" rows={4} maxLength={2000} state={state} />
      <Consent state={state} purpose="to contact you about suitable roles. We delete it after 12 months unless you renew" />
      <Turnstile />
      <div><SubmitButton>Join the talent pool</SubmitButton></div>
    </form>
  );
}
