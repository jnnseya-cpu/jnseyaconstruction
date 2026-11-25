import type { Metadata } from "next";
import { ReopenCookieChoices } from "@/components/CookieConsent";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  description: "The cookies this website uses, why, and how to change your choice. No analytics cookies are set without your consent.",
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage title="Cookies" path="/cookies" updated="2026-11-25" lede="We set no analytics cookies unless you choose “Accept all”. Rejecting is as easy as accepting.">
      <h2>Cookies we use</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">Type</th><th scope="col">Expires</th></tr></thead>
          <tbody>
            <tr><td className="mono">nseya_consent</td><td>Remembers your cookie choice</td><td>Strictly necessary</td><td>12 months</td></tr>
            <tr><td className="mono">nseya_supplier</td><td>Keeps a supplier signed in to their account</td><td>Strictly necessary</td><td>When you sign out, or after 7 days</td></tr>
            <tr><td className="mono">_ga, _ga_*</td><td>Google Analytics 4: counts visits and pages viewed</td><td>Analytics, only with consent</td><td>Up to 2 years</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        We may also use Plausible Analytics, which does not use cookies or collect personal data, to count page views.
        Our spam protection (Cloudflare Turnstile) runs only on pages with forms and does not set tracking cookies.
      </p>
      <h2>Change your choice</h2>
      <p>You can change your choice at any time.</p>
      <ReopenCookieChoices />
    </LegalPage>
  );
}
