"use client";

import { useActionState } from "react";
import { submitContact } from "@/lib/forms/enquiry";
import { initialFormState } from "@/lib/forms/types";
import { Consent, ErrorSummary, Honeypot, SubmitButton, Success, TextArea, TextField, Turnstile } from "./Fields";

/** FM-05 General contact and press. */
export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialFormState);
  if (state.status === "success") return <Success state={state} title="Thank you. We have your message" />;
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <TextField name="name" label="Your name" required autoComplete="name" state={state} />
      <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
      <TextArea name="message" label="Your message" required state={state} rows={5} />
      <Consent state={state} purpose="to reply to your message and keep a record of it for 2 years" />
      <Turnstile />
      <div><SubmitButton>Send message</SubmitButton></div>
    </form>
  );
}
