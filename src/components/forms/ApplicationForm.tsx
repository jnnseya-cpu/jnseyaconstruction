"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { heardOptions } from "@/components/careers/schema";
import { submitApplication } from "@/lib/forms/careers";
import { useDirectUploads } from "@/components/forms/useDirectUploads";
import { initialFormState } from "@/lib/forms/types";
import { ChoiceGroup, Consent, ErrorSummary, FileField, Honeypot, SubmitButton, Success, TextArea, TextField, Turnstile, UploadStatus } from "./Fields";
import styles from "./ApplicationForm.module.css";

/** Fields saved on this device while the person fills the form in. Never files, never equality or referral answers. */
const SAVED_FIELDS = ["name", "email", "phone", "role", "rightToWork", "applyRoute", "aboutYou", "experience", "whyConstruction", "graduationDate", "degree"];

/** FM-04 job application (section 5a). Works on a phone in under five minutes; a CV is never required. */
export function ApplicationForm({ role, vacancySlug, graduate = false, startRoute = "cv" }: { role?: string; vacancySlug?: string; graduate?: boolean; startRoute?: "cv" | "no-cv" }) {
  const [state, dispatch] = useActionState(submitApplication, initialFormState);
  const { onSubmit, uploadStatus } = useDirectUploads(dispatch);
  const [route, setRoute] = useState<string>(startRoute);
  const [mounted, setMounted] = useState(false);
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const key = `nseya-application:${vacancySlug ?? "general"}`;

  // Restore saved progress once.
  useEffect(() => {
    setMounted(true);
    const form = formRef.current;
    if (!form) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Record<string, string> | null;
      if (!saved) return;
      for (const name of SAVED_FIELDS) {
        const v = saved[name];
        if (!v) continue;
        const els = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
        els.forEach((el) => {
          if (el instanceof HTMLInputElement && (el.type === "radio" || el.type === "checkbox")) el.checked = el.value === v;
          else if (!el.value) el.value = v;
        });
      }
      if (saved.applyRoute) setRoute(saved.applyRoute);
      setRestored(true);
    } catch {
      /* storage unavailable */
    }
  }, [key]);

  useEffect(() => {
    if (typeof state.values?.applyRoute === "string") setRoute(state.values.applyRoute);
    if (state.status === "success") {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }, [state, key]);

  const save = () => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const out: Record<string, string> = {};
    for (const name of SAVED_FIELDS) {
      const v = fd.get(name);
      if (typeof v === "string" && v) out[name] = v;
    }
    try {
      localStorage.setItem(key, JSON.stringify(out));
    } catch {
      /* ignore */
    }
  };

  const clearSaved = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    formRef.current?.reset();
    setRestored(false);
    setRoute(startRoute);
  };

  if (state.status === "success") {
    return (
      <Success state={state} title="Thank you. We have your application">
        <p>We reply to every applicant within 10 working days. We will email you at each stage: received, shortlisted, interview and outcome.</p>
        <p><Link href="/careers/vacancies">See other vacancies</Link></p>
      </Success>
    );
  }

  // Without JavaScript both sections show and the person fills in the one they chose.
  const showCv = !mounted || route === "cv";
  const showGuided = !mounted || route === "no-cv";

  return (
    <form ref={formRef} action={dispatch} onSubmit={onSubmit} className="form" noValidate onInput={save} onChange={save}>
      <ErrorSummary state={state} />
      {restored && (
        <div className="notice" role="status">
          <p>We have filled in what you typed last time on this device. Files and optional questions are not saved. <button type="button" className={styles.linkButton} onClick={clearSaved}>Start again</button></p>
        </div>
      )}
      <Honeypot />
      {vacancySlug && <input type="hidden" name="vacancySlug" value={vacancySlug} />}

      <section className={styles.part} aria-labelledby="part-1">
        <h2 id="part-1" className={styles.partTitle}><span>Part 1 of 3</span>About you</h2>
        <TextField name="name" label="Your full name" required autoComplete="name" state={state} />
        <div className="form-row">
          <TextField name="email" type="email" label="Email address" required autoComplete="email" inputMode="email" state={state} />
          <TextField name="phone" type="tel" label="Phone number" required autoComplete="tel" inputMode="tel" state={state} />
        </div>
        <TextField name="role" label="Role you are applying for" required state={state} defaultValue={role} />
        <ChoiceGroup
          name="rightToWork" label="Do you have the right to work in the UK?" required state={state}
          hint="Just answer yes or no. Do not send any documents. If we offer you a job, we check this with you in person."
          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
        />
        {graduate && (
          <div className="form-row">
            <TextField name="degree" label="Degree subject" state={state} />
            <TextField name="graduationDate" label="When did you graduate?" hint="Month and year, for example July 2025" state={state} />
          </div>
        )}
      </section>

      <section className={styles.part} aria-labelledby="part-2">
        <h2 id="part-2" className={styles.partTitle}><span>Part 2 of 3</span>Your experience</h2>
        <ChoiceGroup
          name="applyRoute" label="How do you want to apply?" required state={state} defaultValue={startRoute} onChange={setRoute}
          options={[
            { value: "cv", label: "Upload my CV", hint: "PDF or Word file, up to 10MB" },
            { value: "no-cv", label: "Apply without a CV", hint: "Answer three short questions instead. This is just as good." },
          ]}
        />
        {showCv && (
          <div className={styles.branch}>
            {!mounted && <p className="hint">If you chose “Upload my CV”:</p>}
            <FileField name="cv" label="Your CV" hint="PDF or Word (.docx). Up to 10MB." accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" state={state} required={mounted} uploadKind="cv" />
          </div>
        )}
        {showGuided && (
          <div className={styles.branch}>
            {!mounted && <p className="hint">If you chose “Apply without a CV”:</p>}
            <TextArea name="aboutYou" label="Tell us about yourself" hint="A few sentences is fine. What are you good at? What do you enjoy?" rows={4} state={state} required={mounted} maxLength={2000} />
            <TextArea name="experience" label="Any work or volunteering" hint="Any job, volunteering, caring or study counts. Write 'none' if you have not worked yet." rows={4} state={state} maxLength={2000} />
            <TextArea name="whyConstruction" label="Why do you want to work in construction?" rows={4} state={state} required={mounted} maxLength={2000} />
          </div>
        )}
      </section>

      <section className={styles.part} aria-labelledby="part-3">
        <h2 id="part-3" className={styles.partTitle}><span>Part 3 of 3</span>Optional questions</h2>
        <div className="notice">
          <p><strong>You can skip all of these.</strong> They help us use support schemes for new starters. We never use them to decide who to shortlist, and we keep them apart from your application.</p>
        </div>
        <ChoiceGroup name="heardFrom" label="How did you hear about us?" state={state} options={heardOptions.map((o) => ({ value: o.value, label: o.label }))} columns />
        <ChoiceGroup name="workCoach" label="Did a work coach refer you to us?" state={state} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        <details className={styles.equality}>
          <summary>Equality monitoring (optional)</summary>
          <p className="hint">These answers are stored separately with no name or contact details. Nobody deciding on your application can see them. We only use them in anonymous reports.</p>
          <ChoiceGroup name="eqAge" label="Age group" state={state} columns options={["16 to 18", "19 to 24", "25 to 34", "35 to 49", "50 or over", "Prefer not to say"].map((v) => ({ value: v, label: v }))} />
          <ChoiceGroup name="eqGender" label="Gender" state={state} columns options={["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"].map((v) => ({ value: v, label: v }))} />
          <ChoiceGroup name="eqEthnicity" label="Ethnic group" state={state} columns options={["Asian or Asian British", "Black, Black British, Caribbean or African", "Mixed or multiple ethnic groups", "White", "Other ethnic group", "Prefer not to say"].map((v) => ({ value: v, label: v }))} />
          <ChoiceGroup name="eqDisability" label="Do you consider yourself to have a disability?" state={state} columns options={["Yes", "No", "Prefer not to say"].map((v) => ({ value: v, label: v }))} />
        </details>
      </section>

      <Consent state={state} purpose="to consider you for this and similar roles. We delete it 6 months after the outcome if you are not hired" />
      <Turnstile />
      <UploadStatus status={uploadStatus} />
      <div><SubmitButton pendingText="Sending your application…">Send application</SubmitButton></div>
    </form>
  );
}
