import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getLegalEntity } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Modern slavery statement",
  description: "The steps Nseya Group Construction takes to keep modern slavery and human trafficking out of its business and supply chain.",
  alternates: { canonical: "/modern-slavery" },
};

/**
 * Voluntary statement: the group is below the £36m turnover threshold in
 * section 54 of the Modern Slavery Act 2015. TO CONFIRM: align wording with
 * the ETABLIX statement already drafted, then have Justin approve and sign.
 */
export default function ModernSlavery() {
  const e = getLegalEntity();
  return (
    <LegalPage title="Modern slavery statement" path="/modern-slavery" updated="2026-11-25" lede="A voluntary statement for the first year of trading, 2027.">
      <h2>About this statement</h2>
      <p>
        {e.legalName} is below the turnover threshold that makes a statement a legal requirement under section 54 of the Modern Slavery Act 2015. We publish one anyway,
        because construction has a high risk of forced labour in labour supply, materials and site services, and about 80% of our work will be delivered through subcontractors and suppliers.
      </p>
      <h2>Our business and supply chain</h2>
      <p>
        Nseya Group Construction has three trading companies: Nseya Consultancy, ETABLIX and Nseya Construction. We start trading in 2027 from Birmingham.
        Our supply chain will include trade subcontractors, labour providers, plant and welfare hire, materials suppliers, security and cleaning.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>Every supplier accepts our supplier code and a modern slavery declaration before approval.</li>
        <li>We pay approved suppliers within 30 days, which removes one pressure that leads to labour exploitation.</li>
        <li>We check right to work for our own staff in person, and require labour providers to do the same and show us their records on request.</li>
        <li>We treat security, cleaning, labour supply and imported materials such as PPE and solar components as higher risk, and ask more questions of those suppliers.</li>
        <li>Site supervisors are trained to spot signs of forced labour and know how to report them, including to the Modern Slavery Helpline on 08000 121 700.</li>
      </ul>
      <h2>How we will measure progress</h2>
      <p>From 2027 we will report the share of approved suppliers who have signed the declaration, training completed by supervisors, and any concerns raised and how they were dealt with.</p>
      <h2>Approval</h2>
      <p>This statement will be approved by the director and reviewed every year.</p>
      <p>See also our <Link href="/suppliers/code-and-policies">supplier code and policies</Link>.</p>
    </LegalPage>
  );
}
