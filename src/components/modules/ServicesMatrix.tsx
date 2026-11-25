import type { Company, Sector, Service } from "@/content/types";

/**
 * Services and sectors matrix (section 7a, P1): every service against every
 * sector; each marked cell opens the service on its company page.
 */
export function ServicesMatrix({ services, companies, sectors }: { services: Service[]; companies: Company[]; sectors: Sector[] }) {
  const byId = Object.fromEntries(companies.map((c) => [c.id, c]));
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="matrix-caption" style={{ position: "relative" }}>
      <table className="matrix">
        <caption id="matrix-caption" className="visually-hidden">
          Services by sector. A marked cell means the service is offered in that sector; select it to open the service.
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: "left", paddingLeft: 14 }}>Service</th>
            {sectors.map((s) => <th scope="col" key={s.id}>{s.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {services.map((svc) => {
            const c = byId[svc.company];
            return (
              <tr key={svc.slug} data-company={svc.company}>
                <th scope="row">
                  {svc.name}
                  <span className="mono" style={{ display: "block", fontSize: "0.6875rem", color: "var(--ink-2)", letterSpacing: "0.04em" }}>{c.shortName.toUpperCase()}</span>
                </th>
                {sectors.map((sec) =>
                  svc.sectors.includes(sec.id) ? (
                    <td key={sec.id}>
                      <a href={`${c.path}#${svc.slug}`} aria-label={`${svc.name} for ${sec.name}`}>
                        <span className="dot" aria-hidden="true" />
                      </a>
                    </td>
                  ) : (
                    <td key={sec.id}><span className="visually-hidden">Not offered</span></td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
