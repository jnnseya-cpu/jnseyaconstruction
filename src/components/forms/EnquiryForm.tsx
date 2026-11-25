"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/lib/forms/enquiry";
import { budgetBands, enquiryTypeLabels, enquiryTypes } from "@/lib/forms/enquiry-options";
import { useDirectUploads } from "@/components/forms/useDirectUploads";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, Consent, ErrorSummary, FileField, Honeypot, SelectField, SubmitButton, Success, TextArea, TextField, Turnstile, UploadStatus } from "./Fields";

const budgetLabels: Record<(typeof budgetBands)[number], string> = {
  "under-50k": "Under £50,000",
  "50k-250k": "£50,000 to £250,000",
  "250k-1m": "£250,000 to £1 million",
  "1m-5m": "£1 million to £5 million",
  "over-5m": "Over £5 million",
  unknown: "Not known yet",
};

/** FM-01 Project enquiry. `company` pre-selects the company (PG-03 acceptance criterion). */
export function EnquiryForm({ company, enquiryType, sourcePage }: { company?: string; enquiryType?: string; sourcePage: string }) {
  const [state, dispatch] = useActionState(submitEnquiry, initialFormState);
  const { onSubmit, uploadStatus } = useDirectUploads(dispatch);
  if (state.status === "success") {
    return (
      <Success state={{ ...state, ref: undefined }} title="Thank you — your enquiry is with us.">
        <p>A named director will reply by the end of the next working day.</p>
        {state.ref && <p>Your reference is <span className="ref">{state.ref}</span></p>}
      </Success>
    );
  }
  return (
    <form action={dispatch} onSubmit={onSubmit} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <TextField name="name" label="Name" required autoComplete="name" state={state} />
      <div className="form-row">
        <TextField name="email" type="email" label="Email" required autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" type="tel" label="Phone" autoComplete="tel" inputMode="tel" state={state} />
      </div>
      <ChoiceGroup
        name="company" label="Which company?" required state={state} defaultValue={company} columns
        options={[
          { value: "consultancy", label: "Consultancy" },
          { value: "etablix", label: "ETABLIX" },
          { value: "construction", label: "Construction" },
          { value: "not-sure", label: "Not sure" },
        ]}
      />
      <TextArea name="message" label="About your project" required state={state} />
      <details className="more-detail" open={!!enquiryType || state.status === "error"}>
        <summary>Add more detail (optional)</summary>
        <div className="form">
          <TextField name="organisation" label="Organisation" autoComplete="organization" state={state} />
          <SelectField name="enquiryType" label="What is it about?" state={state} defaultValue={enquiryType} placeholder="A project I want to discuss"
            options={enquiryTypes.filter((t) => t !== "project").map((t) => ({ value: t, label: enquiryTypeLabels[t] }))} />
          <div className="form-row">
            <TextField name="location" label="Project location" hint="Town or postcode" state={state} />
            <SelectField name="budget" label="Budget band" state={state} placeholder="Choose a band" options={budgetBands.map((b) => ({ value: b, label: budgetLabels[b] }))} />
          </div>
          <TextField name="startDate" label="Expected start" hint="For example, June 2027" state={state} />
          <FileField name="attachment" label="Drawings or other files" hint="PDF, Word, Excel, JPG or PNG. Up to 20MB." accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" state={state} uploadKind="attachment" />
        </div>
      </details>
      <Consent state={state} purpose="to reply to your enquiry and keep a record of it for 2 years" />
      <Turnstile />
      <UploadStatus status={uploadStatus} />
      <div className="submit-row">
        <SubmitButton>Send my enquiry</SubmitButton>
        <p className="hint" style={{ margin: 0 }}>We reply within one working day.</p>
      </div>
    </form>
  );
}
