import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import { companyFilterOptions, contractLabels, routeOptions } from "@/components/careers/schema";
import { VacancyCard } from "@/components/careers/VacancyCard";
import { JobAlertForm } from "@/components/forms/JobAlertForm";
import { PageHero } from "@/components/PageHero";
import { getOpenVacancies } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Vacancies",
  description: "Current graduate, apprentice, trainee and experienced construction vacancies at Nseya Groupe Construction, Birmingham.",
  alternates: { canonical: "/careers/vacancies" },
};

type Params = { company?: string; route?: string; location?: string; contract?: string };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

/* CR-05. Filtering is a plain GET form rendered on the server, so it works without JavaScript. */
export default async function VacanciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f: Params = { company: one(sp.company), route: one(sp.route), location: one(sp.location), contract: one(sp.contract) };
  const all = getOpenVacancies(); // already sorted by closing date; closed roles excluded
  const locations = [...new Set(all.map((v) => v.location))].sort();
  const list = all.filter(
    (v) =>
      (!f.company || v.company === f.company) &&
      (!f.route || v.route === f.route) &&
      (!f.location || v.location === f.location) &&
      (!f.contract || v.contractType === f.contract),
  );
  const filtered = Object.values(f).some(Boolean);

  const select = (name: keyof Params, label: string, options: { value: string; label: string }[], all: string) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <select className="select" id={`f-${name}`} name={name} defaultValue={f[name]}>
        <option value="">{all}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Vacancies", href: "/careers/vacancies" }]}
        label="Vacancies"
        title="Current vacancies"
        lede="Sorted by closing date. Roles disappear from this page after their closing date."
      />
      <CareersNav current="/careers/vacancies" />
      <section className="section">
        <div className="container">
          <form className="filter-bar" method="get" action="/careers/vacancies" role="search" aria-label="Filter vacancies">
            {select("company", "Company", companyFilterOptions.map((o) => ({ value: o.value, label: o.label })), "All companies")}
            {select("route", "Route", routeOptions.map((o) => ({ value: o.value, label: o.label })), "All routes")}
            {select("location", "Location", locations.map((l) => ({ value: l, label: l })), "All locations")}
            {select("contract", "Contract type", Object.entries(contractLabels).map(([value, label]) => ({ value, label })), "All contract types")}
            <div className="btn-row">
              <button type="submit" className="btn">Apply filters</button>
              {filtered && <Link className="btn btn--ghost" href="/careers/vacancies">Clear</Link>}
            </div>
          </form>

          <p className="filter-count" role="status">
            {list.length} {list.length === 1 ? "vacancy" : "vacancies"}{filtered ? " match your filters" : " open"}
          </p>

          {list.length > 0 ? (
            <div className="cards cards--2">
              {list.map((v) => <VacancyCard key={v.slug} v={v} />)}
            </div>
          ) : (
            <div className="notice">
              <h2 style={{ fontSize: "1.25rem" }}>{filtered ? "No vacancies match these filters" : "No vacancies are open right now"}</h2>
              <p>
                Join our talent pool. Tell us which routes and areas interest you, and we will contact you when a suitable role opens.
              </p>
              <p><Link className="btn" href="/careers/talent-pool">Join the talent pool</Link></p>
            </div>
          )}
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="alerts-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Job alerts</p>
            <h2 id="alerts-title">Get an email when a role opens</h2>
            <p className="muted">One email per new role. Every email has a link to stop them.</p>
          </div>
          <div className="span-7">
            <JobAlertForm />
          </div>
        </div>
      </section>
    </div>
  );
}
