import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ForgetSavedApplication } from "@/components/forms/SupplierApplication";

export const metadata: Metadata = { title: "Application received", description: "Your supplier application has been received.", robots: { index: false } };

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const safeRef = ref && /^SUP-\d{4}-\d{4,}$/.test(ref) ? ref : null;
  return (
    <>
      <ForgetSavedApplication />
      <PageHero label="Supplier application" title="Application received" crumbs={[{ name: "Suppliers", href: "/suppliers" }, { name: "Application received", href: "/suppliers/apply/submitted" }]} />
      <section className="section section--tight">
        <div className="container grid">
          <div className="span-8">
            <div className="form-success" role="status">
              <h2>Thank you. We have your application</h2>
              {safeRef && <p>Your reference number is <span className="ref">{safeRef}</span>We have also sent it to you by email.</p>}
              <p>Status: <strong>Registered, not yet vetted</strong>.</p>
            </div>
            <h2 style={{ marginTop: 40 }}>What happens next</h2>
            <ol className="steps">
              <li><h3>Automatic checks</h3><p>Done as you submitted. Any problems are listed for our coordinator.</p></li>
              <li><h3>Review, within 10 working days</h3><p>Our supply-chain coordinator checks your evidence and references.</p></li>
              <li><h3>Decision by email</h3><p>Approved, approved with conditions, more information needed, or not approved, with the reason.</p></li>
            </ol>
            <p><Link className="link-arrow" href="/suppliers/account">Sign in to your supplier account</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
