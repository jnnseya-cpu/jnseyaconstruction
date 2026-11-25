"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { saveStep, startApplication, submitApplication } from "@/lib/forms/supplier";
import { initialFormState, type FormState } from "@/lib/forms/types";
import {
  businessTypeLabel, businessTypes, capabilities, categories, cisStatuses, companySizes, isRegisteredBusiness, docTypeLabels, isoStandards, jobSizes, otherAccreditations, regions, ssipSchemes,
} from "@/lib/suppliers/catalogue";
import type { SupplierDoc, SupplierDraftData } from "@/lib/suppliers/model";
import { skipsHealthAndSafety } from "@/lib/suppliers/rules";
import { ChoiceGroup, Consent, ErrorSummary, FileField, Honeypot, SelectField, SubmitButton, TextField, Turnstile } from "./Fields";

export const STEPS = ["Company", "What you do", "Accreditations", "Insurance", "Policies and declarations", "Review and submit"];
const STORAGE_KEY = "nseya_supplier_resume";
const DOC_ACCEPT = ".pdf,.jpg,.jpeg,.png";
const DOC_HINT = "PDF, JPG or PNG, up to 10MB.";

/* ---------------- Start (email first, so progress can be saved) ---------------- */

export function StartApplication() {
  const [state, action] = useActionState(startApplication, initialFormState);
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => {
    try {
      setSaved(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* storage unavailable */
    }
  }, []);
  return (
    <>
      {saved && (
        <div className="notice" style={{ marginBottom: 28 }}>
          <p><strong>You have a saved application on this device.</strong></p>
          <p><Link className="link-arrow" href={`/suppliers/apply?resume=${encodeURIComponent(saved)}`}>Continue your application</Link></p>
        </div>
      )}
      <form action={action} className="form" noValidate>
        <ErrorSummary state={state} />
        <Honeypot />
        <TextField name="email" type="email" label="Your work email address" required autoComplete="email" inputMode="email" state={state}
          hint="We email you a private link so you can stop and finish later. We use this address for all messages about your application." />
        <Consent state={state} purpose="to assess your application to join our supply chain and, if approved, to manage your supplier record" />
        <Turnstile />
        <div><SubmitButton pendingText="Starting…">Start application</SubmitButton></div>
      </form>
    </>
  );
}

/* ---------------- Progress ---------------- */

function Progress({ step }: { step: number }) {
  return (
    <>
      <p className="label" aria-hidden="true">Step {step} of 6</p>
      <ol className="progress" aria-label="Application progress">
        {STEPS.map((s, i) => (
          <li key={s} data-state={i + 1 < step ? "done" : i + 1 === step ? "current" : "todo"} aria-current={i + 1 === step ? "step" : undefined}>
            <span className="visually-hidden">{i + 1 < step ? "Completed: " : i + 1 === step ? "Current step: " : "Not started: "}</span>
            {s}
          </li>
        ))}
      </ol>
    </>
  );
}

/* ---------------- Shell for steps 1-5 ---------------- */

function StepForm({ token, step, title, intro, children }: { token: string; step: number; title: string; intro?: ReactNode; children: (state: FormState) => ReactNode }) {
  const [state, action] = useActionState(saveStep, initialFormState);
  return (
    <form action={action} className="form" noValidate>
      <h2 style={{ marginBottom: 0 }}>{title}</h2>
      {intro && <div className="muted">{intro}</div>}
      <ErrorSummary state={state} />
      <input type="hidden" name="resume" value={token} />
      <input type="hidden" name="step" value={step} />
      {children(state)}
      <div className="btn-row">
        {step > 1 && (
          <button type="submit" name="intent" value="back" className="btn btn--ghost" formNoValidate>Back</button>
        )}
        <SubmitButton pendingText="Saving…">Save and continue</SubmitButton>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Your answers are saved each time you continue. You can close this page and use the link in your email to come back.</p>
    </form>
  );
}

const existing = (docs: SupplierDoc[], type: string) => docs.find((d) => d.type === type && !d.superseded);
const fileHint = (docs: SupplierDoc[], type: string) => {
  const d = existing(docs, type);
  return d ? `Already uploaded: ${d.file.name}. Upload a new file only to replace it. ${DOC_HINT}` : DOC_HINT;
};

/* ---------------- Step 1: Company ---------------- */

function CompanyLookup() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const lookup = async () => {
    const input = document.getElementById("companyNumber") as HTMLInputElement | null;
    const n = input?.value.trim();
    if (!n) {
      setMsg("Enter your company number first.");
      return;
    }
    setBusy(true);
    setMsg("Looking up Companies House…");
    try {
      const res = await fetch(`/api/companies-house/${encodeURIComponent(n)}`);
      if (res.status === 400) setMsg("That does not look like a company number. It has 8 characters, like 12345678 or SC123456.");
      else if (res.status === 404) setMsg("Companies House has no company with that number. Check it, or type your details below.");
      else if (!res.ok) setMsg("The Companies House lookup is not available just now. Please type your company name and registered address below.");
      else {
        const j = (await res.json()) as { name: string; address: string; status: string; number: string };
        const set = (id: string, v: string) => {
          const el = document.getElementById(id) as HTMLInputElement | null;
          if (el) el.value = v;
        };
        set("legalName", j.name);
        set("registeredAddress", j.address);
        set("companyNumber", j.number);
        setMsg(`Found: ${j.name}. Status at Companies House: ${j.status}. Check the details below.`);
      }
    } catch {
      setMsg("The Companies House lookup is not available just now. Please type your details below.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <button type="button" className="btn btn--ghost" onClick={lookup} disabled={busy}>Look up at Companies House</button>
      <p className="hint" role="status" aria-live="polite" style={{ marginTop: 8 }}>{msg}</p>
    </div>
  );
}

function Step1({ token, d }: { token: string; d: SupplierDraftData }) {
  const c = d.company;
  const [type, setType] = useState<string>(c?.businessType ?? "");
  const registered = !type || isRegisteredBusiness(type);
  return (
    <StepForm token={token} step={1} title="Your business" intro="Limited companies, LLPs, sole traders and partnerships can all apply.">
      {(state) => (
        <>
          <ChoiceGroup name="businessType" label="What type of business are you?" required state={state} defaultValue={c?.businessType} columns
            onChange={setType} options={businessTypes.map((b) => ({ value: b.value, label: b.label, hint: b.hint }))} />
          {registered ? (
            <>
              <TextField name="companyNumber" label="Company number" hint="8 characters, like 12345678 or SC123456" required state={state} defaultValue={c?.companyNumber} maxLength={10} />
              <CompanyLookup />
            </>
          ) : (
            <p className="notice small" style={{ margin: 0 }}>
              You do not need a company number. After you apply, our supply-chain coordinator will call you to confirm your identity, your Unique Taxpayer Reference and your CIS status.
            </p>
          )}
          <TextField name="legalName" label={registered ? "Company legal name" : type === "partnership" ? "Partnership or trading name" : "Your name and any trading name"}
            hint={registered ? undefined : "For example, Sam Patel trading as Patel Groundworks"} required autoComplete="organization" state={state} defaultValue={c?.legalName} />
          <TextField name="registeredAddress" label={registered ? "Registered office address" : "Business address"} required state={state} defaultValue={c?.registeredAddress} />
          <div className="form-row">
            <TextField name="vatNumber" label="VAT number" hint="If registered" state={state} defaultValue={c?.vatNumber} />
            <SelectField name="yearsTrading" label="Years trading" required state={state} defaultValue={c?.yearsTrading}
              options={[{ value: "under-1", label: "Less than 1 year" }, { value: "1-2", label: "1 to 2 years" }, { value: "3-5", label: "3 to 5 years" }, { value: "6-10", label: "6 to 10 years" }, { value: "over-10", label: "More than 10 years" }]} />
          </div>
          <SelectField name="size" label="Size of business" required state={state} defaultValue={c?.size} options={companySizes.map((s) => ({ ...s }))} />
          <div className="form-row">
            <TextField name="contactName" label="Contact person" required autoComplete="name" state={state} defaultValue={c?.contactName} />
            <TextField name="contactRole" label="Their role" state={state} defaultValue={c?.contactRole} />
          </div>
          <TextField name="phone" type="tel" label="Phone number" required autoComplete="tel" inputMode="tel" state={state} defaultValue={c?.phone} />
          <ChoiceGroup name="regions" label="Regions you cover" hint="Choose all that apply." required multiple columns state={state}
            defaultValue={c?.regions} options={regions.map((r) => ({ value: r, label: r }))} />
        </>
      )}
    </StepForm>
  );
}

/* ---------------- Step 2: What you do ---------------- */

function Step2({ token, d }: { token: string; d: SupplierDraftData }) {
  const w = d.work;
  return (
    <StepForm token={token} step={2} title="What you do"
      intro={<p style={{ margin: 0 }}>Site-services suppliers for ETABLIX (cabins, welfare, security, cleaning) register on <a href="https://etablix.com" rel="noopener">etablix.com<span className="visually-hidden"> (separate website)</span></a> instead.</p>}>
      {(state) => (
        <>
          <ChoiceGroup name="categories" label="Categories" hint="Choose all that apply." required multiple state={state} defaultValue={w?.categories}
            options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <ChoiceGroup name="trades" label="Trades and products" hint="Choose all that apply." required multiple columns state={state} defaultValue={w?.trades}
            options={categories.flatMap((c) => c.examples.map((e) => ({ value: e, label: e })))} />
          <TextField name="otherTrades" label="Other trades" hint="Anything not listed above" state={state} defaultValue={w?.otherTrades} />
          <SelectField name="jobSize" label="Typical job size" required state={state} defaultValue={w?.jobSize} options={jobSizes.map((j) => ({ ...j }))} />
          <div className="form-row">
            <TextField name="capacityPeople" label="People you can put on site" hint="For example, 12 operatives and 2 supervisors" state={state} defaultValue={w?.capacityPeople} />
            <TextField name="capacityPlant" label="Plant you own" hint="For example, two 13t excavators" state={state} defaultValue={w?.capacityPlant} />
          </div>
          <ChoiceGroup name="capabilities" label="Specialist capabilities" multiple state={state} defaultValue={w?.capabilities}
            options={capabilities.map((c) => ({ value: c.id, label: c.label, hint: "hint" in c ? c.hint : undefined }))} />
        </>
      )}
    </StepForm>
  );
}

/* ---------------- Step 3: Accreditations ---------------- */

function Step3({ token, d }: { token: string; d: SupplierDraftData }) {
  const a = d.accreditations;
  return (
    <StepForm token={token} step={3} title="Accreditations"
      intro={<p style={{ margin: 0 }}>If you hold a valid SSIP certificate or Constructionline Gold, you skip the health and safety questions in step 5. This follows the industry&apos;s Common Assessment Standard.</p>}>
      {(state) => (
        <>
          <ChoiceGroup name="ssipSchemes" label="SSIP member schemes" hint="Choose any you belong to." multiple columns state={state} defaultValue={a?.ssipSchemes}
            options={ssipSchemes.map((s) => ({ value: s, label: s }))} />
          <div className="form-row">
            <TextField name="ssipExpiry" type="date" label="SSIP certificate expiry date" hint="Needed if you chose a scheme" state={state} defaultValue={a?.ssipExpiry} />
            <FileField name="ssipCert" label="SSIP certificate" hint={fileHint(d.documents, "ssip-cert")} accept={DOC_ACCEPT} state={state} />
          </div>
          <SelectField name="constructionline" label="Constructionline level" required state={state} defaultValue={a?.constructionline ?? "none"} placeholder="Choose a level"
            options={[{ value: "none", label: "Not a member" }, { value: "bronze", label: "Bronze" }, { value: "silver", label: "Silver" }, { value: "gold", label: "Gold" }, { value: "platinum", label: "Platinum" }]} />
          <div className="form-row">
            <TextField name="constructionlineExpiry" type="date" label="Constructionline expiry date" hint="Needed if you are a member" state={state} defaultValue={a?.constructionlineExpiry} />
            <FileField name="constructionlineCert" label="Constructionline certificate" hint={fileHint(d.documents, "constructionline-cert")} accept={DOC_ACCEPT} state={state} />
          </div>
          <ChoiceGroup name="iso" label="ISO certification" multiple columns state={state} defaultValue={a?.iso} options={isoStandards.map((s) => ({ value: s, label: s }))} />
          <ChoiceGroup name="other" label="Other registrations" multiple columns state={state} defaultValue={a?.other} options={otherAccreditations.map((s) => ({ value: s, label: s }))} />
          <TextField name="cscs" label="CSCS and other cards" hint="For example, all operatives hold CSCS; 2 supervisors hold SSSTS" state={state} defaultValue={a?.cscs} />
        </>
      )}
    </StepForm>
  );
}

/* ---------------- Step 4: Insurance ---------------- */

function Cover({ k, label, required, note, d, state }: { k: "el" | "pl" | "pi" | "cw"; label: string; required: boolean; note: string; d: SupplierDraftData; state: FormState }) {
  const ins = d.insurance?.[k];
  return (
    <fieldset className="fieldset" style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
      <legend style={{ fontSize: "1.125rem" }}>{label} {required ? <span className="visually-hidden">(required)</span> : <span className="opt">(optional)</span>}</legend>
      <p className="hint" style={{ margin: 0 }}>{note}</p>
      <div className="form-row">
        <TextField name={`${k}Limit`} label="Limit of indemnity (£)" hint="For example, 10000000" inputMode="numeric" required={required} state={state}
          defaultValue={ins?.limit ? String(ins.limit) : undefined} />
        <TextField name={`${k}Expiry`} type="date" label="Expiry date" required={required} state={state} defaultValue={ins?.expiry} />
      </div>
      <FileField name={`${k}Cert`} label="Certificate" hint={fileHint(d.documents, k)} accept={DOC_ACCEPT} required={required && !existing(d.documents, k)} state={state} />
    </fieldset>
  );
}

function Step4({ token, d, minimumsText }: { token: string; d: SupplierDraftData; minimumsText: { el: string; pl: string; plPower: string; pi: string } }) {
  const designer = !!d.work && (d.work.capabilities.includes("design") || d.work.categories.includes("consultants"));
  const power = !!d.work && (d.work.capabilities.includes("power-highway") || d.work.categories.includes("power"));
  return (
    <StepForm token={token} step={4} title="Insurance" intro="Give the limit and expiry date for each policy and upload the certificate.">
      {(state) => (
        <>
          <Cover k="el" label="Employer's liability" required note={`Group minimum: ${minimumsText.el}.`} d={d} state={state} />
          <Cover k="pl" label="Public liability" required note={`Group minimum: ${power ? `${minimumsText.plPower} for power and highway work` : minimumsText.pl}.`} d={d} state={state} />
          <Cover k="pi" label="Professional indemnity" required={designer} note={designer ? `Required because you carry design responsibility. Group minimum: ${minimumsText.pi}.` : "Only needed for designers and consultants."} d={d} state={state} />
          <Cover k="cw" label="Contract works" required={false} note="If you hold it." d={d} state={state} />
        </>
      )}
    </StepForm>
  );
}

/* ---------------- Step 5: Policies and declarations ---------------- */

function Declaration({ name, children, state }: { name: string; children: ReactNode; state: FormState }) {
  const error = state.errors?.[name];
  return (
    <div className="field" id={name} tabIndex={-1}>
      {error && <p className="field-error">{error}</p>}
      <label className="choice">
        <input type="checkbox" name={name} value="yes" required aria-invalid={error ? true : undefined} />
        <span>{children}</span>
      </label>
    </div>
  );
}

function Step5({ token, d }: { token: string; d: SupplierDraftData }) {
  const skip = skipsHealthAndSafety(d.accreditations ?? {});
  return (
    <StepForm token={token} step={5} title="Policies and declarations">
      {(state) => (
        <>
          {skip.skip ? (
            <div className="notice"><p>Because you hold a {skip.reason}, you do not need to upload a health and safety policy or answer health and safety questions.</p></div>
          ) : (
            <FileField name="hsPolicy" label="Health and safety policy" hint={`Signed and dated in the last 12 months. ${fileHint(d.documents, "hs-policy")}`} required={!existing(d.documents, "hs-policy")} accept={DOC_ACCEPT} state={state} />
          )}
          <FileField name="qualityPolicy" label="Quality policy" hint={fileHint(d.documents, "quality-policy")} accept={DOC_ACCEPT} state={state} />
          <FileField name="envPolicy" label="Environmental policy" hint={fileHint(d.documents, "env-policy")} accept={DOC_ACCEPT} state={state} />
          <FileField name="equalityPolicy" label="Equality policy" hint={fileHint(d.documents, "equality-policy")} accept={DOC_ACCEPT} state={state} />
          <fieldset className="fieldset">
            <legend>Declarations</legend>
            <Declaration name="modernSlavery" state={state}>We take steps to make sure there is no modern slavery or human trafficking in our business or supply chain, and we will tell you if we find any.</Declaration>
            <Declaration name="antiBribery" state={state}>We do not offer, pay or accept bribes, and we have procedures to prevent bribery under the Bribery Act 2010.</Declaration>
            <Declaration name="supplierCode" state={state}>We accept the <Link href="/suppliers/code-and-policies" target="_blank">supplier code<span className="visually-hidden"> (opens in a new tab)</span></Link>.</Declaration>
            <Declaration name="platformRule" state={state}>On every project we win, we will work in CONSTRUX or VERYX, whichever the project uses, and submit payment applications only through it. A seat is free.</Declaration>
          </fieldset>
          <SelectField name="cis" label="Construction Industry Scheme (CIS) status" required state={state} defaultValue={d.policies?.cis} options={cisStatuses.map((c) => ({ ...c }))} />
        </>
      )}
    </StepForm>
  );
}

/* ---------------- Step 6: Review and submit ---------------- */

function Row({ k, v }: { k: string; v?: ReactNode }) {
  return (<><dt>{k}</dt><dd>{v || "Not given"}</dd></>);
}

function Step6({ token, d }: { token: string; d: SupplierDraftData }) {
  const [state, action] = useActionState(submitApplication, initialFormState);
  const back = useActionState(saveStep, initialFormState)[1];
  const c = d.company;
  const w = d.work;
  const a = d.accreditations;
  const money = (n?: number) => (n ? `£${n.toLocaleString("en-GB")}` : undefined);
  return (
    <div className="stack" style={{ ["--stack" as string]: "28px" }}>
      <h2 style={{ marginBottom: 0 }}>Check your answers</h2>
      <section aria-labelledby="sum-company">
        <h3 id="sum-company" style={{ fontSize: "1.125rem" }}>Company</h3>
        <dl className="dl">
          <Row k="Legal name" v={c?.legalName} />
          <Row k="Business type" v={businessTypeLabel(c?.businessType)} />
          {c?.companyNumber ? <Row k="Company number" v={c.companyNumber} /> : null}
          <Row k="Registered office" v={c?.registeredAddress} />
          <Row k="VAT number" v={c?.vatNumber} />
          <Row k="Contact" v={c && `${c.contactName}${c.contactRole ? `, ${c.contactRole}` : ""} · ${c.phone} · ${d.email}`} />
          <Row k="Regions" v={c?.regions.join(", ")} />
        </dl>
      </section>
      <section aria-labelledby="sum-work">
        <h3 id="sum-work" style={{ fontSize: "1.125rem" }}>What you do</h3>
        <dl className="dl">
          <Row k="Categories" v={w?.categories.map((id) => categories.find((x) => x.id === id)?.name ?? id).join(", ")} />
          <Row k="Trades" v={[...(w?.trades ?? []), ...(w?.otherTrades ? [w.otherTrades] : [])].join(", ")} />
          <Row k="Typical job size" v={jobSizes.find((j) => j.value === w?.jobSize)?.label} />
          <Row k="Capabilities" v={w?.capabilities.map((id) => capabilities.find((x) => x.id === id)?.label ?? id).join(", ")} />
        </dl>
      </section>
      <section aria-labelledby="sum-acc">
        <h3 id="sum-acc" style={{ fontSize: "1.125rem" }}>Accreditations and insurance</h3>
        <dl className="dl">
          <Row k="SSIP" v={a?.ssipSchemes?.length ? `${a.ssipSchemes.join(", ")} (expires ${a.ssipExpiry})` : "None"} />
          <Row k="Constructionline" v={a?.constructionline && a.constructionline !== "none" ? `${a.constructionline} (expires ${a.constructionlineExpiry})` : "Not a member"} />
          <Row k="Other" v={[...(a?.iso ?? []), ...(a?.other ?? [])].join(", ") || "None"} />
          {(["el", "pl", "pi", "cw"] as const).map((k) =>
            d.insurance?.[k] ? <Row key={k} k={docTypeLabels[k].replace(" insurance certificate", "")} v={`${money(d.insurance[k]!.limit)}, expires ${d.insurance[k]!.expiry}`} /> : null,
          )}
          <Row k="CIS" v={cisStatuses.find((x) => x.value === d.policies?.cis)?.label} />
        </dl>
      </section>
      <section aria-labelledby="sum-docs">
        <h3 id="sum-docs" style={{ fontSize: "1.125rem" }}>Documents uploaded</h3>
        <ul>{d.documents.map((doc) => <li key={doc.id}>{doc.label}: {doc.file.name}{doc.expiry ? ` (expires ${doc.expiry})` : ""}</li>)}</ul>
      </section>
      <form action={back}>
        <input type="hidden" name="resume" value={token} />
        <input type="hidden" name="step" value={6} />
        <button type="submit" name="intent" value="back" className="btn btn--ghost">Back to change your answers</button>
      </form>
      <form action={action} className="form" noValidate>
        <ErrorSummary state={state} />
        <Honeypot />
        <input type="hidden" name="resume" value={token} />
        <div className="field" id="truthful" tabIndex={-1}>
          {state.errors?.truthful && <p className="field-error">{state.errors.truthful}</p>}
          <label className="choice">
            <input type="checkbox" name="truthful" value="yes" required />
            <span>I confirm that the information in this application is true and complete, and that I am authorised to submit it for the company.</span>
          </label>
        </div>
        <Consent state={state} purpose="to assess your application, run the checks described on the Suppliers page, and keep your supplier record while you are active and for 6 years after" />
        <Turnstile />
        <div><SubmitButton pendingText="Submitting…">Submit application</SubmitButton></div>
      </form>
    </div>
  );
}

/* ---------------- Wizard ---------------- */

export function SupplierWizard({ token, draft, minimumsText }: { token: string; draft: SupplierDraftData; minimumsText: { el: string; pl: string; plPower: string; pi: string } }) {
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      /* storage unavailable */
    }
  }, [token]);
  const step = Math.min(6, Math.max(1, draft.step));
  return (
    <div>
      <Progress step={step} />
      {step === 1 && <Step1 key="1" token={token} d={draft} />}
      {step === 2 && <Step2 key="2" token={token} d={draft} />}
      {step === 3 && <Step3 key="3" token={token} d={draft} />}
      {step === 4 && <Step4 key="4" token={token} d={draft} minimumsText={minimumsText} />}
      {step === 5 && <Step5 key="5" token={token} d={draft} />}
      {step === 6 && <Step6 key="6" token={token} d={draft} />}
    </div>
  );
}

export function ForgetSavedApplication() {
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);
  return null;
}
