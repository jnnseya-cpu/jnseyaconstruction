import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { contact } from "@/content/settings";
import { getLegalEntity } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How JNN Global Ltd uses personal data from enquiries, supplier registrations, job applications and newsletter sign-ups.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  const e = getLegalEntity();
  return (
    <LegalPage title="Privacy notice" path="/privacy" updated="2026-11-25" lede="One notice for everyone who uses this website: clients, suppliers, job applicants and newsletter readers.">
      <h2 id="who-we-are">Who we are</h2>
      <p>
        The data controller is {e.legalName} (company number {e.companyNumber}), {e.placeOfRegistration.toLowerCase()}, trading as {e.tradingAs}.
        Our registered office is {e.registeredOffice}. We are registered with the Information Commissioner&apos;s Office (ICO) under number {e.icoRegistration}.
      </p>
      <p>
        Nseya Consultancy, ETABLIX and Nseya Construction are the trading companies of Nseya Group Construction. Until each company is incorporated, {e.legalName} is the controller for all of them.
      </p>
      <p>
        To contact us about your data, use the <Link href="/contact">contact form</Link> and choose &quot;Anything else&quot;
        {contact.email ? <>, or email <a href={`mailto:${contact.email}`}>{contact.email}</a></> : null}.
      </p>

      <h2 id="what-we-collect">What we collect, why, and our lawful basis</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th scope="col">Who you are</th><th scope="col">What we collect</th><th scope="col">Why</th><th scope="col">Lawful basis (UK GDPR)</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Enquirers and clients</td>
              <td>Name, organisation, email, phone, project details, files you attach</td>
              <td>To reply, prepare proposals and keep a record of the enquiry</td>
              <td>Legitimate interests (Art. 6(1)(f)); steps before a contract (Art. 6(1)(b))</td>
            </tr>
            <tr>
              <td>Suppliers and subcontractors</td>
              <td>Contact details, company details, trades, accreditations, insurance certificates, policies</td>
              <td>To vet firms, set them up on project platforms, and keep evidence in date</td>
              <td>Steps before a contract (Art. 6(1)(b)); legal obligation for health and safety records (Art. 6(1)(c)); legitimate interests</td>
            </tr>
            <tr>
              <td>Job applicants and talent pool</td>
              <td>Name, contact details, CV or the answers you give, right-to-work answer (yes or no), qualifications, optional referral source</td>
              <td>To assess your application and contact you about it</td>
              <td>Steps before a contract (Art. 6(1)(b)); consent for the talent pool (Art. 6(1)(a))</td>
            </tr>
            <tr>
              <td>Equality monitoring (optional)</td>
              <td>Answers you choose to give about protected characteristics</td>
              <td>To check our recruitment is fair, in anonymised reports only</td>
              <td>Explicit consent (Art. 9(2)(a)) and equality of opportunity monitoring (Data Protection Act 2018, Sch. 1, para 8)</td>
            </tr>
            <tr>
              <td>Newsletter readers</td>
              <td>Email address</td>
              <td>To send field notes about once a month</td>
              <td>Consent (Art. 6(1)(a)), confirmed by a link we email to you</td>
            </tr>
            <tr>
              <td>Website visitors</td>
              <td>Pages viewed, browser type, approximate location (country)</td>
              <td>To see which pages help visitors</td>
              <td>Cookieless analytics: legitimate interests. Analytics cookies: consent. See <Link href="/cookies">cookies</Link></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We never ask for bank details through an open form. We ask approved suppliers for them only through their signed-in account, and confirm them by phone.
        We do right-to-work checks in person or through an approved provider, never by asking you to upload documents to this website.
      </p>
      <p>
        Equality monitoring answers are stored separately from applications, are never seen by the people who shortlist, and are used only in anonymised reports.
        Answers about how you heard about us, or whether a work coach referred you, are kept apart from your application and are never used for shortlisting.
      </p>

      <h2 id="retention">How long we keep it</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th scope="col">Record</th><th scope="col">Kept for</th></tr></thead>
          <tbody>
            <tr><td>Enquiries and general messages</td><td>2 years from the enquiry</td></tr>
            <tr><td>Unsuccessful job applications</td><td>6 months, then deleted automatically</td></tr>
            <tr><td>Successful applicants</td><td>Moved to the employee file, kept under our HR retention schedule</td></tr>
            <tr><td>Talent pool</td><td>12 months, then deleted unless you renew</td></tr>
            <tr><td>Supplier records</td><td>While the supplier is active, plus 6 years</td></tr>
            <tr><td>Newsletter</td><td>Until you unsubscribe. Unconfirmed sign-ups are deleted after 30 days</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="sharing">Who we share it with</h2>
      <p>
        We use service providers who process data for us under contract: website hosting and database (Google Cloud, UK or EU region), email delivery,
        spam protection (Cloudflare Turnstile) and, if you consent, analytics. Supplier records are kept in CONSTRUX, the group&apos;s project platform, and counts
        (not personal details) feed VERYX, our business dashboard. We do not sell personal data. Where a provider is outside the UK, we rely on UK adequacy
        regulations or the International Data Transfer Agreement.
      </p>

      <h2 id="your-rights">Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>ask for a copy of your data (access);</li>
        <li>ask us to correct it;</li>
        <li>ask us to delete it;</li>
        <li>object to, or ask us to restrict, how we use it;</li>
        <li>ask for it in a portable format;</li>
        <li>withdraw consent at any time, where we rely on consent.</li>
      </ul>
      <p>
        To make a request, use the <Link href="/contact">contact form</Link>. We reply within one month. If you are unhappy with how we handle your data,
        you can complain to the ICO at <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">ico.org.uk/make-a-complaint</a> or on 0303 123 1113.
      </p>

      <h2 id="security">Security</h2>
      <p>
        Files you upload are virus-scanned and kept in private storage, never on a public web address. Staff areas use single sign-on with two-factor authentication,
        and staff see only the records their role needs.
      </p>

      <h2 id="changes">Changes</h2>
      <p>We will update the date at the top of this page when this notice changes.</p>
    </LegalPage>
  );
}
