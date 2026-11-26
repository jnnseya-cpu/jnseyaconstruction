import Link from "next/link";
import styles from "./LandToHandover.module.css";

/**
 * From land to handover: the six stages, the company that leads each, and
 * where to read more. Plain HTML list, so it works without JavaScript and is
 * read in order by screen readers.
 */
const stages = [
  { title: "Appraise", lead: "consultancy", leadName: "Nseya Consultancy", text: "What the site is worth to your scheme, and whether the numbers work.", href: "/consultancy#land-appraisal", link: "Land appraisal" },
  { title: "Acquire", lead: "consultancy", leadName: "Nseya Consultancy", text: "Site finding and due diligence on title, ground, utilities and access.", href: "/consultancy#site-acquisition", link: "Site acquisition" },
  { title: "Plan", lead: "consultancy", leadName: "Nseya Consultancy", text: "Planning strategy and the application, with every survey and report it needs.", href: "/consultancy#planning", link: "Planning" },
  { title: "Design and cost", lead: "consultancy", leadName: "Nseya Consultancy", text: "Feasibility, cost plan, procurement and a coordinated model.", href: "/consultancy#cost-management", link: "Cost and BIM" },
  { title: "Build", lead: "construction", leadName: "Nseya Construction", text: "Enabling works on the raw land, then the build. ETABLIX runs the site services.", href: "/construction#site-enabling-works", link: "Enabling and build" },
  { title: "Hand over", lead: "construction", leadName: "Nseya Construction", text: "Commissioning, as-built records and asset data ready to run the building.", href: "/construction#bim", link: "Digital handover" },
] as const;

export function LandToHandover() {
  return (
    <ol className={styles.track} aria-label="From land to handover, in six stages">
      {stages.map((s) => (
        <li key={s.title} data-company={s.lead} data-reveal>
          <span className={styles.bar} aria-hidden="true" />
          <span className={styles.lead}>{s.leadName}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <Link className="link-arrow" href={s.href}>{s.link}</Link>
        </li>
      ))}
    </ol>
  );
}
