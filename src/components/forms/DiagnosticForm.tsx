"use client";

import { useActionState } from "react";
import { submitDiagnostic } from "@/lib/forms/diagnostic";
import { projectTypeLabels, projectTypes } from "@/lib/forms/diagnostic-options";
import { useDirectUploads } from "@/components/forms/useDirectUploads";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, Consent, ErrorSummary, FileField, Honeypot, SelectField, SubmitButton, Success, TextArea, TextField, Turnstile, UploadStatus } from "./Fields";

/** FM-02 Site Systems Diagnostic request (ETABLIX). */
export function DiagnosticForm({ sourcePage = "/etablix" }: { sourcePage?: string }) {
  const [state, dispatch] = useActionState(submitDiagnostic, initialFormState);
  const { onSubmit, uploadStatus } = useDirectUploads(dispatch);
  const booking = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (state.status === "success") {
    return (
      <Success state={state} title="Thank you. We have your diagnostic request">
        <p>We reply within one working day to arrange the call.</p>
        {booking && state.ref && (
          <p>
            <a className="btn" href={booking} rel="noopener">
              Choose a time for the call<span className="visually-hidden"> (opens the booking calendar)</span>
            </a>
          </p>
        )}
      </Success>
    );
  }
  return (
    <form action={dispatch} onSubmit={onSubmit} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <div className="form-row">
        <TextField name="name" label="Your name" required autoComplete="name" state={state} />
        <TextField name="organisation" label="Organisation" required autoComplete="organization" state={state} />
      </div>
      <div className="form-row">
        <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" inputMode="tel" state={state} />
      </div>
      <SelectField name="projectType" label="Project type" required state={state} options={projectTypes.map((t) => ({ value: t, label: projectTypeLabels[t] }))} />
      <div className="form-row">
        <TextField name="workforcePeak" label="Workforce peak" hint="The most people on site at one time" required inputMode="numeric" state={state} />
        <TextField name="programmeMonths" label="Programme length in months" required inputMode="numeric" state={state} />
      </div>
      <div className="form-row">
        <TextField name="location" label="Project location" hint="Town, postcode or grid reference" required state={state} />
        <TextField name="startDate" label="Expected start on site" hint="For example, June 2027" state={state} />
      </div>
      <ChoiceGroup
        name="remoteSite" label="Is the site remote or greenfield, with no existing welfare or accommodation nearby?" state={state} columns
        options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" }]}
      />
      <TextField name="tradesNeeded" label="Site services you think you need" hint="For example: cabins, welfare, security, cleaning, accommodation" state={state} />
      <TextArea name="message" label="Tell us about the project" hint="What is being built, who the client is, and what worries you about the site set-up." required state={state} rows={5} />
      <FileField name="attachment" label="Attach a site plan or programme" hint="PDF, Word, Excel, JPG or PNG. Up to 20MB." accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" state={state} uploadKind="attachment" />
      <Consent state={state} purpose="to arrange your diagnostic call and keep a record of your request for 2 years" />
      <Turnstile />
      <UploadStatus status={uploadStatus} />
      <div><SubmitButton>Request a diagnostic call</SubmitButton></div>
    </form>
  );
}
