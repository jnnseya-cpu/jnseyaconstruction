import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { StartApplication, SupplierWizard } from "@/components/forms/SupplierApplication";
import { loadDraft } from "@/lib/suppliers/data";
import { gbp, minimums } from "@/lib/suppliers/minimums";

export const metadata: Metadata = {
  title: "Apply to join our supply chain",
  description: "Six-step online application for subcontractors, suppliers, plant hirers and consultants. Save and finish later.",
  alternates: { canonical: "/suppliers/apply" },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ resume?: string }> }) {
  const { resume } = await searchParams;
  const draft = resume ? await loadDraft(resume) : null;
  const minimumsText = {
    el: gbp(minimums.employersLiability),
    pl: gbp(minimums.publicLiability),
    plPower: gbp(minimums.publicLiabilityPowerHighway),
    pi: gbp(minimums.professionalIndemnityDesigners),
  };
  return (
    <>
      <PageHero
        label="Supplier application"
        title="Apply to join our supply chain"
        lede="Six short steps. With your insurance certificates and policies to hand, most firms finish in about 20 minutes."
        crumbs={[{ name: "Suppliers", href: "/suppliers" }, { name: "Apply", href: "/suppliers/apply" }]}
      />
      <section className="section section--tight">
        <div className="container grid">
          <div className="span-8">
            {resume && !draft ? (
              <div className="notice notice--draft" role="alert">
                <p><strong>This link has expired or is not valid.</strong> Application links last 30 days. Start again below.</p>
              </div>
            ) : null}
            {draft ? (
              <SupplierWizard token={resume!} draft={draft.data} minimumsText={minimumsText} />
            ) : (
              <>
                <h2>Before you start</h2>
                <p>Have these ready. You can upload them as PDF, JPG or PNG.</p>
                <ul>
                  <li>Your company number (we look up your details at Companies House)</li>
                  <li>Insurance certificates: employer&apos;s liability, public liability, and professional indemnity if you design</li>
                  <li>Your SSIP or Constructionline certificate, if you have one, or your health and safety policy</li>
                </ul>
                <p className="muted small">Site-services suppliers for ETABLIX register on <a href="https://etablix.com" rel="noopener">etablix.com<span className="visually-hidden"> (separate website)</span></a>. We never ask for bank details on this form.</p>
                <StartApplication />
              </>
            )}
          </div>
          <aside className="span-4" aria-label="Help">
            <div className="notice">
              <p><strong>Already applied?</strong></p>
              <p><Link href="/suppliers/account">Sign in to see your status or update documents</Link>.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
