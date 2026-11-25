import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { ServicesFilter } from "@/components/modules/ServicesFilter";
import { ServicesMatrix } from "@/components/modules/ServicesMatrix";
import { PageHero } from "@/components/PageHero";
import { getCompanies, getSectors, getServices } from "@/lib/cms";

export const metadata: Metadata = {
  title: "All services across the group",
  description: "Every service from Nseya Consultancy, ETABLIX and Nseya Construction, filterable by company and sector, with a services-by-sector matrix.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const services = getServices();
  const companies = getCompanies();
  const sectors = getSectors();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", href: "/services" }]}
        label="Services index"
        title="Every service across the three companies"
        lede={`${services.length} services from Nseya Consultancy, ETABLIX and Nseya Construction. Filter by company or sector, or use the matrix to see which services we offer in each sector.`}
      />
      <section className="section" aria-labelledby="list-title">
        <div className="container">
          <h2 id="list-title" className="visually-hidden">Services</h2>
          <ServicesFilter services={services} companies={companies} sectors={sectors} />
        </div>
      </section>
      <section className="section section--concrete" aria-labelledby="matrix-title">
        <div className="container">
          <p className="label">Services and sectors</p>
          <h2 id="matrix-title">Which services we offer in each sector</h2>
          <p className="muted">Select a marked cell to open that service on its company page.</p>
          <ServicesMatrix services={services} companies={companies} sectors={sectors} />
          <p className="small muted" style={{ marginTop: 16 }}>Each service gets its own page during 2027.</p>
        </div>
      </section>
      <CtaBand title="Not sure which company you need?" text="Send one enquiry and we will pass it to the right team within one working day." href="/contact" cta="Send an enquiry" />
    </>
  );
}
