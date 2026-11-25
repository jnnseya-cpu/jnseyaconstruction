"use client";

import { useActionState } from "react";
import { budgetBands, enquiryTypeLabels, enquiryTypes, submitEnquiry } from "@/lib/forms/enquiry";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, Consent, ErrorSummary, FileField, Honeypot, SelectField, SubmitButton, Success, TextArea, TextField, Turnstile } from "./Fields";

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
  const [state, action] = useActionState(submitEnquiry, initialFormState);
  if (state.status === "success") {
    return <Success state={state} title="Thank you. We have your enquiry">
      <p>We reply to every enquiry within one working day.</p>
    </Success>;
  }
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <div className="form-row">
        <TextField name="name" label="Your name" required autoComplete="name" state={state} />
        <TextField name="organisation" label="Organisation" hint="Or write 'Private individual'" required autoComplete="organization" state={state} />
      </div>
      <div className="form-row">
        <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" type="tel" label="Phone number" autoComplete="tel" inputMode="tel" state={state} />
      </div>
      <ChoiceGroup
        name="company" label="Which company do you want to talk to?" required state={state} defaultValue={company} columns
        options={[
          { value: "consultancy", label: "Nseya Consultancy", hint: "Project, cost and controls management" },
          { value: "etablix", label: "ETABLIX", hint: "Site services and workforce villages" },
          { value: "construction", label: "Nseya Construction", hint: "Buildings, power and digital" },
          { value: "not-sure", label: "Not sure", hint: "We will pass it to the right team" },
        ]}
      />
      <SelectField name="enquiryType" label="What is your enquiry about?" required state={state} defaultValue={enquiryType}
        options={enquiryTypes.map((t) => ({ value: t, label: enquiryTypeLabels[t] }))} />
      <TextArea name="message" label="Your message" hint="Tell us what you need, where, and when." required state={state} />
      <div className="form-row">
        <TextField name="location" label="Project location" hint="Town or postcode" state={state} />
        <SelectField name="budget" label="Budget band" state={state} placeholder="Choose a band" options={budgetBands.map((b) => ({ value: b, label: budgetLabels[b] }))} />
      </div>
      <TextField name="startDate" label="Expected start" hint="For example, June 2027" state={state} />
      <FileField name="attachment" label="Attach a file" hint="PDF, Word, Excel, JPG or PNG. Up to 20MB." accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" state={state} />
      <Consent state={state} purpose="to reply to your enquiry and keep a record of it for 2 years" />
      <Turnstile />
      <div><SubmitButton>Send enquiry</SubmitButton></div>
    </form>
  );
}
