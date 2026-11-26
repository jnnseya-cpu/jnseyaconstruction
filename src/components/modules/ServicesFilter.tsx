"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Company, Sector, Service } from "@/content/types";

/**
 * Services index filter (PG-06). The full list is server-rendered, so without
 * JavaScript visitors get a complete, usable list. Once hydrated, the filter
 * bar appears and filters without a page reload. Filters are mirrored in the
 * query string (?company=&sector=) so a filtered view can be shared.
 */
export function ServicesFilter({ services, companies, sectors }: { services: Service[]; companies: Company[]; sectors: Sector[] }) {
  const [mounted, setMounted] = useState(false);
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setCompany(q.get("company") ?? "");
    setSector(q.get("sector") ?? "");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const q = new URLSearchParams();
    if (company) q.set("company", company);
    if (sector) q.set("sector", sector);
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [company, sector, mounted]);

  const shown = useMemo(
    () => services.filter((s) => (!company || s.company === company || s.alsoBy?.includes(company as Service["company"])) && (!sector || s.sectors.includes(sector as Service["sectors"][number]))),
    [services, company, sector],
  );
  const byId = Object.fromEntries(companies.map((c) => [c.id, c]));
  const sectorName = Object.fromEntries(sectors.map((s) => [s.id, s.name]));

  return (
    <div>
      {mounted && (
        <div className="filter-bar" role="search" aria-label="Filter services">
          <div className="field">
            <label htmlFor="filter-company">Company</label>
            <select id="filter-company" className="select" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="">All companies</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-sector">Sector</label>
            <select id="filter-sector" className="select" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">All sectors</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {(company || sector) && (
            <button type="button" className="btn btn--ghost" onClick={() => { setCompany(""); setSector(""); }}>
              Clear filters
            </button>
          )}
        </div>
      )}
      <p className="filter-count" role="status" aria-live="polite">
        Showing {shown.length} of {services.length} services
      </p>
      {shown.length === 0 ? (
        <p>No services match these filters. <button type="button" className="btn btn--ghost" onClick={() => { setCompany(""); setSector(""); }}>Show all services</button></p>
      ) : (
        <ul className="cards" style={{ listStyle: "none", padding: 0 }}>
          {shown.map((s) => {
            const c = byId[s.company];
            return (
              <li key={s.slug} data-company={s.company} style={{ margin: 0, display: "flex" }}>
                <div className="card card--company" style={{ minHeight: 0, width: "100%" }}>
                  <span className="card__code">{[c, ...(s.alsoBy ?? []).map((id) => byId[id])].map((x) => x.name.toUpperCase()).join(" AND ")}</span>
                  <h3 style={{ fontSize: "1.25rem" }}>
                    <Link href={`${c.path}#${s.slug}`} className="stretched" style={{ color: "inherit", textDecoration: "none" }}>{s.name}</Link>
                  </h3>
                  <p>{s.summary}</p>
                  <p className="small" style={{ marginTop: 8 }}>
                    <span className="visually-hidden">Sectors: </span>
                    {s.sectors.map((id) => sectorName[id]).join(" · ")}
                  </p>
                  <span className="card__foot link-arrow" aria-hidden="true">Read more</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
