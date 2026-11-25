"use client";

import { useActionState } from "react";
import { ErrorSummary, Honeypot, SelectField, SubmitButton, TextField, FileField, Turnstile, UploadStatus } from "@/components/forms/Fields";
import { consumeLogin, requestLogin, uploadRenewal } from "@/lib/forms/supplier";
import { useDirectUploads } from "@/components/forms/useDirectUploads";
import { initialFormState } from "@/lib/forms/types";

export function LoginForm() {
  const [state, action] = useActionState(requestLogin, initialFormState);
  if (state.status === "success") {
    return (
      <div className="form-success" role="status">
        <h2>Check your email</h2>
        <p>{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <Honeypot />
      <TextField name="email" type="email" label="Email address" hint="The address you used for your supplier application" required autoComplete="email" inputMode="email" state={state} />
      <Turnstile />
      <div><SubmitButton pendingText="Sending…">Email me a sign-in link</SubmitButton></div>
    </form>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const [state, action] = useActionState(consumeLogin, initialFormState);
  return (
    <form action={action} className="form" noValidate>
      <ErrorSummary state={state} />
      <input type="hidden" name="token" value={token} />
      <div><SubmitButton pendingText="Signing in…">Sign in to your supplier account</SubmitButton></div>
    </form>
  );
}

export function RenewalForm({ options, defaultType }: { options: { value: string; label: string }[]; defaultType?: string }) {
  const [state, dispatch] = useActionState(uploadRenewal, initialFormState);
  const { onSubmit, uploadStatus } = useDirectUploads(dispatch);
  return (
    <form action={dispatch} onSubmit={onSubmit} className="form" noValidate key={state.status === "success" ? state.message : "form"}>
      {state.status === "success" && (
        <div className="form-success" role="status"><p style={{ margin: 0 }}>{state.message}</p></div>
      )}
      <ErrorSummary state={state} />
      <SelectField name="docType" label="Which document?" required state={state} defaultValue={defaultType} options={options} />
      <div className="form-row">
        <TextField name="expiry" type="date" label="New expiry date" hint="Not needed for policies" state={state} />
        <TextField name="limit" label="Insurance limit (£)" hint="Only if it has changed" inputMode="numeric" state={state} />
      </div>
      <FileField name="file" label="New document" hint="PDF, JPG or PNG, up to 10MB." required accept=".pdf,.jpg,.jpeg,.png" state={state} />
      <UploadStatus status={uploadStatus} />
      <div><SubmitButton pendingText="Uploading…">Upload document</SubmitButton></div>
    </form>
  );
}
