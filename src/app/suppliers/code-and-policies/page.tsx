import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { DocCard } from "@/components/DocCard";
import { PageHero } from "@/components/PageHero";
import { getPolicies } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Supplier code and policies",
  description: "Our supplier code, modern slavery statement and the health and safety, anti-bribery, fair payment and environmental standards we expect.",
  alternates: { canonical: "/suppliers/code-and-policies" },
};

const expectations = [
  { id: "supplier-code", title: "Supplier code of conduct", text: "How we expect every supplier to behave: honestly, safely, lawfully, and with respect for workers, neighbours and the environment. Breaches are investigated and can end the relationship." },
  { id: "modern-slavery", title: "Modern slavery", text: "No forced, bonded or child labour. No recruitment fees charged to workers. You check your own supply chain and tell us straight away if you find a problem. This follows the Modern Slavery Act 2015." },
  { id: "health-and-safety", title: "Health and safety", text: "Work to CDM 2015 and our site rules: risk assessments and method statements before work starts, competent and carded operatives, and every incident and near miss reported the same day." },
  { id: "anti-bribery", title: "Anti-bribery", text: "No bribes, kickbacks or facilitation payments, and gifts or hospitality recorded. You have procedures to prevent bribery, as the Bribery Act 2010 requires." },
  { id: "fair-payment", title: "Fair payment", text: "We pay valid applications within 30 days. We expect you to pay your own suppliers and operatives promptly, and never to hold back money unfairly." },
  { id: "environmental", title: "Environmental", text: "Manage waste under your duty of care, prevent pollution, and help us cut carbon on site: lower-carbon plant and fuel where practical, and accurate records of waste and energy." },
];

export default function CodeAndPoliciesPage() {
  const docs = getPolicies("group");
  return (
    <>
      <PageHero
        label="Suppliers and subcontractors"
        title="Supplier code and policies"
        lede="What we expect from everyone in our supply chain, and the documents behind it. Each document shows its version and review date."
        crumbs={[{ name: "Suppliers", href: "/suppliers" }, { name: "Supplier code and policies", href: "/suppliers/code-and-policies" }]}
      />
      <section className="section">
        <div className="container grid">
          <div className="span-7">
            <h2>What we expect</h2>
            {expectations.map((e) => (
              <div key={e.id} id={e.id} style={{ borderTop: "1px solid var(--line)", padding: "20px 0" }}>
                <h3 style={{ fontSize: "1.125rem" }}>{e.title}</h3>
                <p style={{ margin: 0 }}>{e.text}</p>
              </div>
            ))}
          </div>
          <div className="span-5">
            <h2>Documents</h2>
            <div className="stack" style={{ ["--stack" as string]: "12px" }}>
              {docs.map((d) => <DocCard key={d.slug} doc={d} />)}
            </div>
            <p className="small muted" style={{ marginTop: 16 }}>
              Documents marked &ldquo;in preparation&rdquo; are being finalised before we start trading. ETABLIX publishes its own supplier code and modern slavery statement on{" "}
              <a href="https://etablix.com" rel="noopener">etablix.com<span className="visually-hidden"> (separate website)</span></a>.
            </p>
            <p><Link className="link-arrow" href="/modern-slavery">Read our modern slavery statement</Link></p>
          </div>
        </div>
      </section>
      <CtaBand title="Ready to join our supply chain?" href="/suppliers/apply" cta="Apply to join" secondary={{ href: "/suppliers", label: "How vetting works" }} />
    </>
  );
}
