"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/forms/types";

/* Shared form controls (section 7 core components; section 6 rules; WCAG 2.2 AA:
   a label on every field, errors beside the field and announced, no time limits). */

type Common = { name: string; label: ReactNode; hint?: ReactNode; required?: boolean; state?: FormState; className?: string };

const val = (state: FormState | undefined, name: string, fallback = "") => {
  const v = state?.values?.[name];
  return typeof v === "string" ? v : fallback;
};
const vals = (state: FormState | undefined, name: string, fallback: string[] = []) => {
  const v = state?.values?.[name];
  return Array.isArray(v) ? v : typeof v === "string" ? [v] : fallback;
};

function Label({ htmlFor, label, required }: { htmlFor: string; label: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor}>
      {label} {required ? <span className="visually-hidden">(required)</span> : <span className="opt">(optional)</span>}
    </label>
  );
}

function describedBy(name: string, hint?: ReactNode, error?: string) {
  return [hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;
}

function Meta({ name, hint, error }: { name: string; hint?: ReactNode; error?: string }) {
  return (
    <>
      {hint && <p className="hint" id={`${name}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${name}-error`}>{error}</p>}
    </>
  );
}

export function TextField({
  name, label, hint, required, state, type = "text", autoComplete, defaultValue, inputMode, className, maxLength,
}: Common & { type?: string; autoComplete?: string; defaultValue?: string; inputMode?: "numeric" | "tel" | "email" | "text"; maxLength?: number }) {
  const error = state?.errors?.[name];
  return (
    <div className={`field ${className ?? ""}`}>
      <Label htmlFor={name} label={label} required={required} />
      <Meta name={name} hint={hint} error={error} />
      <input
        className="input" id={name} name={name} type={type} required={required} autoComplete={autoComplete} inputMode={inputMode}
        maxLength={maxLength} defaultValue={val(state, name, defaultValue)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(name, hint, error)}
        key={`${name}-${state?.status}-${val(state, name, defaultValue)}`}
      />
    </div>
  );
}

export function TextArea({ name, label, hint, required, state, rows = 6, defaultValue, maxLength = 5000 }: Common & { rows?: number; defaultValue?: string; maxLength?: number }) {
  const error = state?.errors?.[name];
  return (
    <div className="field">
      <Label htmlFor={name} label={label} required={required} />
      <Meta name={name} hint={hint} error={error} />
      <textarea
        className="textarea" id={name} name={name} rows={rows} required={required} maxLength={maxLength}
        defaultValue={val(state, name, defaultValue)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(name, hint, error)}
        key={`${name}-${state?.status}`}
      />
    </div>
  );
}

export function SelectField({ name, label, hint, required, state, options, defaultValue, placeholder = "Choose one" }: Common & { options: { value: string; label: string }[]; defaultValue?: string; placeholder?: string }) {
  const error = state?.errors?.[name];
  return (
    <div className="field">
      <Label htmlFor={name} label={label} required={required} />
      <Meta name={name} hint={hint} error={error} />
      <select
        className="select" id={name} name={name} required={required} defaultValue={val(state, name, defaultValue)}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy(name, hint, error)} key={`${name}-${state?.status}-${defaultValue}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function ChoiceGroup({
  name, label, hint, required, state, options, multiple = false, defaultValue, columns = false, onChange,
}: Common & { options: { value: string; label: ReactNode; hint?: ReactNode }[]; multiple?: boolean; defaultValue?: string | string[]; columns?: boolean; onChange?: (v: string) => void }) {
  const error = state?.errors?.[name];
  const selected = multiple ? vals(state, name, Array.isArray(defaultValue) ? defaultValue : []) : [val(state, name, typeof defaultValue === "string" ? defaultValue : "")];
  return (
    <fieldset className="fieldset" aria-describedby={describedBy(name, hint, error)} id={name} tabIndex={-1}>
      <legend>
        {label} {required ? <span className="visually-hidden">(required)</span> : <span className="opt">(optional)</span>}
      </legend>
      <Meta name={name} hint={hint} error={error} />
      <div className={`choices ${columns ? "choices--cols" : ""}`}>
        {options.map((o) => (
          <label className="choice" key={o.value}>
            <input
              type={multiple ? "checkbox" : "radio"} name={name} value={o.value} defaultChecked={selected.includes(o.value)}
              required={required && !multiple} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
              key={`${o.value}-${state?.status}`}
            />
            <span>
              {o.label}
              {o.hint && <span className="hint" style={{ display: "block" }}>{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FileField({ name, label, hint, required, state, accept }: Common & { accept: string }) {
  const error = state?.errors?.[name];
  return (
    <div className="field">
      <Label htmlFor={name} label={label} required={required} />
      <Meta name={name} hint={hint} error={error} />
      <input className="input" type="file" id={name} name={name} accept={accept} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy(name, hint, error)} />
    </div>
  );
}

/** Consent: never pre-ticked; links to the privacy notice and states the purpose (rule 4). */
export function Consent({ state, purpose }: { state?: FormState; purpose: string }) {
  const error = state?.errors?.consent;
  return (
    <div className="field">
      {error && <p className="field-error" id="consent-error">{error}</p>}
      <label className="choice" htmlFor="consent">
        <input type="checkbox" id="consent" name="consent" value="yes" required aria-invalid={error ? true : undefined} aria-describedby={error ? "consent-error" : undefined} />
        <span>
          I agree that Nseya Groupe Construction (JNN Global Ltd) can use the information in this form {purpose}. Read our{" "}
          <Link href="/privacy" target="_blank">privacy notice<span className="visually-hidden"> (opens in a new tab)</span></Link>.
        </span>
      </label>
    </div>
  );
}

export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label htmlFor="website_url">Leave this field empty</label>
      <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function Turnstile() {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!key) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={key} data-appearance="interaction-only" />
    </>
  );
}

export function ErrorSummary({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);
  if (state.status !== "error") return null;
  const entries = Object.entries(state.errors ?? {});
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={ref} aria-labelledby="error-summary-title">
      <h2 id="error-summary-title">There is a problem</h2>
      {state.message && <p>{state.message}</p>}
      {entries.length > 0 && (
        <ul>
          {entries.map(([k, v]) => (
            <li key={k}><a href={`#${k}`}>{v}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SubmitButton({ children, pendingText = "Sending…" }: { children: ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending} aria-disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Success({ state, title, children }: { state: FormState; title: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="form-success" role="status" tabIndex={-1} ref={ref}>
      <h2>{title}</h2>
      {state.ref && (
        <p>
          Your reference number is <span className="ref">{state.ref}</span>
          We have also sent it to you by email.
        </p>
      )}
      {state.message && <p>{state.message}</p>}
      {children}
    </div>
  );
}
