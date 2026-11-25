import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { contact, group, office } from "@/content/settings";
import { getLegalEntity } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Send a project, tender or framework enquiry to Nseya Consultancy, ETABLIX or Nseya Construction. We reply within one working day.",
  alternates: { canonical: "/contact" },
};

const companies = ["consultancy", "etablix", "construction"];
const types = ["project", "tender", "framework", "quote", "partnership", "other"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const company = typeof sp.company === "string" && companies.includes(sp.company) ? sp.company : undefined;
  const type = typeof sp.type === "string" && types.includes(sp.type) ? sp.type : undefined;
  const e = getLegalEntity();

  return (
    <div data-company={company ?? "group"}>
      <PageHero
        label="Contact"
        title="Tell us what you need to build"
        lede={`${contact.responseTime} Your enquiry goes straight to the company you choose.`}
        crumbs={[{ name: "Contact", href: "/contact" }]}
      />

      <section className="section">
        <div className="container grid">
          <div className="span-7">
            <p className="label">Project enquiry</p>
            <h2 id="enquiry">Send an enquiry</h2>
            <p className="muted">Fields marked optional can be left blank. You will get a reference number on screen and by email.</p>
            <EnquiryForm company={company} enquiryType={type} sourcePage="/contact" />
          </div>
          <aside className="span-4 start-8" aria-labelledby="details-title">
            <div className="stack" style={{ position: "sticky", top: "calc(var(--header-h) + 24px)" }}>
              <h2 id="details-title" style={{ fontSize: "var(--fs-h4)" }}>Other ways to reach us</h2>
              <dl className="dl" style={{ gridTemplateColumns: "1fr" }}>
                {contact.email && (<><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></>)}
                {contact.phone && (<><dt>Phone</dt><dd><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></dd></>)}
                <dt>Registered office</dt>
                <dd>
                  {e.legalName}<br />
                  {e.registeredOffice}<br />
                  <a href={office.mapUrl} rel="noopener">View on a map<span className="visually-hidden"> (opens OpenStreetMap)</span></a>
                </dd>
                <dt>Response time</dt>
                <dd>One working day for every enquiry.</dd>
                <dt>ETABLIX</dt>
                <dd>
                  Site services enquiries can also go through <a href={group.etablixUrl} rel="noopener">etablix.com<span className="visually-hidden"> (separate website)</span></a>.
                </dd>
              </dl>
              <div className="notice small">
                <p><strong>Looking for work?</strong> See <a href="/careers">careers</a>. <strong>A subcontractor or supplier?</strong> <a href="/suppliers">Register here</a>.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--concrete section--rule">
        <div className="container grid">
          <div className="span-5">
            <p className="label">General and press</p>
            <h2>Anything else</h2>
            <p className="muted">For press, general questions or requests about your personal data. For data requests, see also our <a href="/privacy#your-rights">privacy notice</a>.</p>
          </div>
          <div className="span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
