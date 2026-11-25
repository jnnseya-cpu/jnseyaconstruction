import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getLegalEntity } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using the Nseya Groupe Construction website, operated by JNN Global Ltd.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  const e = getLegalEntity();
  return (
    <LegalPage title="Terms of use" path="/terms" updated="2026-11-25">
      <h2>Who runs this website</h2>
      <p>This website is run by {e.legalName}, company number {e.companyNumber}, registered office {e.registeredOffice}.</p>
      <h2>Using the website</h2>
      <p>
        You may use this website to find out about our companies, send enquiries, apply for jobs and register as a supplier. You must not misuse it,
        for example by trying to get unauthorised access, uploading harmful files, or sending false information in a form.
      </p>
      <h2>Information on the website</h2>
      <p>
        We work to keep information accurate, but it is general information and not an offer. Services, prices and terms are agreed only in a written contract.
        Drawings and diagrams marked &quot;Illustrative&quot; show methods, not completed Nseya projects. Figures marked &quot;Target&quot; are targets, not results.
      </p>
      <h2>Links to other websites</h2>
      <p>
        We link to other websites, including etablix.com, which ETABLIX runs as its own website. We are not responsible for the content of websites we do not run.
      </p>
      <h2>Intellectual property</h2>
      <p>The content, drawings and design of this website belong to {e.legalName} unless stated. You may share links to any page.</p>
      <h2>Liability</h2>
      <p>
        We are not liable for any loss caused by relying on general information on this website. Nothing in these terms limits liability that cannot be limited by law.
      </p>
      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales, and its courts have jurisdiction.</p>
      <p>How we use personal data is set out in our <Link href="/privacy">privacy notice</Link>.</p>
    </LegalPage>
  );
}
