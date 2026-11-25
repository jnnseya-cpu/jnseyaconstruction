"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./GroupStructure.module.css";

export interface StructureCompany {
  id: "consultancy" | "etablix" | "construction";
  name: string;
  path: string;
  summary: string;
  services: { name: string; summary: string }[];
  externalSite?: { url: string; label: string };
}

const sharedServices = ["Supply chain and vetting", "Health, safety, quality and environment", "CONSTRUX project platform", "VERYX business dashboard", "Recruitment and Graduate Academy"];

/**
 * Group structure explorer (section 7a, Home and About). Without JavaScript
 * every company panel is shown in full; with JavaScript the diagram works as
 * tabs and one panel shows at a time.
 */
export function GroupStructure({ companies, legalEntity, headingLevel = 3 }: { companies: StructureCompany[]; legalEntity: string; headingLevel?: 2 | 3 }) {
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState<StructureCompany["id"]>("consultancy");
  useEffect(() => setEnhanced(true), []);
  const H = headingLevel === 2 ? "h2" : "h3";

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = companies[(i + (e.key === "ArrowRight" ? 1 : companies.length - 1)) % companies.length];
    setActive(next.id);
    document.getElementById(`gs-tab-${next.id}`)?.focus();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.diagram} aria-label="Group structure">
        <div className={styles.parent}>
          <span className={styles.code}>Group</span>
          <strong>Nseya Groupe Construction</strong>
          <span className={styles.entity}>Contracting entity until incorporation: {legalEntity}</span>
        </div>
        <div className={styles.branches} aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className={styles.children} role={enhanced ? "tablist" : undefined} aria-label={enhanced ? "Choose a company" : undefined}>
          {companies.map((c, i) => {
            const selected = active === c.id;
            const inner = (
              <>
                <span className={styles.code}>{String(i + 1).padStart(2, "0")}</span>
                <strong>{c.name}</strong>
                <span className={styles.count}>{c.services.length} services</span>
              </>
            );
            return enhanced ? (
              <button
                key={c.id}
                id={`gs-tab-${c.id}`}
                type="button"
                role="tab"
                data-company={c.id}
                aria-selected={selected}
                aria-controls={`gs-panel-${c.id}`}
                tabIndex={selected ? 0 : -1}
                className={styles.node}
                onClick={() => setActive(c.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {inner}
              </button>
            ) : (
              <a key={c.id} href={`#gs-panel-${c.id}`} data-company={c.id} className={styles.node}>
                {inner}
              </a>
            );
          })}
        </div>
        <div className={styles.shared}>
          <span className={styles.code}>Shared across all three</span>
          <ul>
            {sharedServices.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.panels}>
        {companies.map((c) => (
          <section
            key={c.id}
            id={`gs-panel-${c.id}`}
            data-company={c.id}
            className={styles.panel}
            role={enhanced ? "tabpanel" : undefined}
            aria-labelledby={enhanced ? `gs-tab-${c.id}` : undefined}
            hidden={enhanced && active !== c.id}
            tabIndex={enhanced ? 0 : undefined}
          >
            <H className={styles.panelTitle}>{c.name}</H>
            <p>{c.summary}</p>
            <ul className={styles.serviceList}>
              {c.services.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong>
                  <span>{s.summary}</span>
                </li>
              ))}
            </ul>
            <div className="btn-row">
              <Link className="link-arrow" href={c.path}>
                Go to {c.name}
              </Link>
              {c.externalSite && (
                <a className="link-arrow link-external" href={c.externalSite.url} rel="noopener">
                  {c.externalSite.label}
                  <span className="visually-hidden"> (separate website)</span>
                </a>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
