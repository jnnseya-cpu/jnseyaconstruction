import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { LoginForm, RenewalForm } from "@/components/suppliers/AccountForms";
import { signOut } from "@/lib/forms/supplier";
import { formatDate } from "@/lib/format";
import { docTypeLabels, statusLabels } from "@/lib/suppliers/catalogue";
import { activeDocs, missingDocs } from "@/lib/suppliers/checks";
import { getSignedInSupplier } from "@/lib/suppliers/data";
import { daysUntil } from "@/lib/suppliers/rules";

export const metadata: Metadata = {
  title: "Supplier account",
  description: "Sign in with a one-time email link to see your supplier status and update insurance and certificates.",
  alternates: { canonical: "/suppliers/account" },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const rec = await getSignedInSupplier();
  const crumbs = [{ name: "Suppliers", href: "/suppliers" }, { name: "Supplier account", href: "/suppliers/account" }];

  if (!rec) {
    return (
      <>
        <PageHero label="Supplier account" title="Sign in" lede="No passwords. Enter your email address and we send you a link that signs you in once." crumbs={crumbs} />
        <section className="section section--tight">
          <div className="container grid">
            <div className="span-7"><LoginForm /></div>
            <aside className="span-4 start-8" aria-label="Not registered">
              <div className="notice">
                <p><strong>Not registered yet?</strong></p>
                <p><Link href="/suppliers/apply">Apply to join our supply chain</Link>.</p>
              </div>
            </aside>
          </div>
        </section>
      </>
    );
  }

  const r = rec.data;
  const docs = activeDocs(r.documents).sort((a, b) => (a.expiry ?? "9999").localeCompare(b.expiry ?? "9999"));
  const missing = missingDocs(r);
  const attention = docs.filter((d) => d.expiry && daysUntil(d.expiry) <= 30);
  const options = Object.entries(docTypeLabels).map(([value, label]) => ({ value, label }));

  return (
    <>
      <PageHero label="Supplier account" title={r.company.legalName} lede={`Reference ${rec.ref} · ${r.email}`} crumbs={crumbs}>
        <form action={signOut} style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn--ghost">Sign out</button>
        </form>
      </PageHero>

      <section className="section section--tight">
        <div className="container grid">
          <div className="span-7 stack" style={{ ["--stack" as string]: "40px" }}>
            <div>
              <h2>Status</h2>
              <dl className="dl">
                <dt>Application</dt><dd><strong>{statusLabels[r.status] ?? r.status}</strong></dd>
                <dt>New awards</dt><dd>{r.suspended ? <strong style={{ color: "var(--error)" }}>Suspended until expired documents are replaced</strong> : "Eligible"}</dd>
                <dt>Submitted</dt><dd>{formatDate(r.submittedAt.slice(0, 10))}</dd>
              </dl>
            </div>

            {(missing.length > 0 || attention.length > 0) && (
              <div className="notice notice--draft" role="status">
                <h2 style={{ fontSize: "1.25rem" }}>What needs your attention</h2>
                <ul style={{ marginBottom: 0 }}>
                  {missing.map((m) => <li key={m.type}>Missing: {m.label}</li>)}
                  {attention.map((d) => {
                    const days = daysUntil(d.expiry!);
                    return <li key={d.id}>{d.label}: {days < 0 ? `expired on ${formatDate(d.expiry!)}` : `expires in ${days} day${days === 1 ? "" : "s"} (${formatDate(d.expiry!)})`}</li>;
                  })}
                </ul>
              </div>
            )}

            <div>
              <h2>Your documents</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th scope="col">Document</th><th scope="col">File</th><th scope="col">Expires</th></tr></thead>
                  <tbody>
                    {docs.map((d) => {
                      const days = d.expiry ? daysUntil(d.expiry) : null;
                      return (
                        <tr key={d.id}>
                          <th scope="row">{d.label}</th>
                          <td>{d.file.name}</td>
                          <td className="mono">
                            {d.expiry ? formatDate(d.expiry) : "No expiry"}
                            {days !== null && days < 0 && <span className="tag tag--warn" style={{ marginLeft: 8 }}>Expired</span>}
                            {days !== null && days >= 0 && days <= 30 && <span className="tag tag--warn" style={{ marginLeft: 8 }}>Due soon</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="replace">
              <h2>Replace a document</h2>
              <p className="muted">Upload a renewed insurance certificate or accreditation. It replaces the old one straight away.</p>
              <RenewalForm options={options} defaultType={attention[0]?.type ?? missing[0]?.type} />
            </div>
          </div>

          <aside className="span-4 start-8 stack" aria-label="Your details">
            <div className="notice">
              <h2 style={{ fontSize: "1.125rem" }}>Your details</h2>
              <p className="small" style={{ margin: 0 }}>
                {r.company.contactName}<br />{r.company.phone}<br />{r.company.registeredAddress}<br />Company number {r.company.companyNumber}
              </p>
              <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>To change these, reply to any email from us with your reference number.</p>
            </div>
            <div className="notice">
              <h2 style={{ fontSize: "1.125rem" }}>Bank details</h2>
              <p className="small" style={{ margin: 0 }}>We ask for bank details only after approval, here in your account, and confirm them by a phone call to a number we already hold. We never ask for or change bank details by email.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
