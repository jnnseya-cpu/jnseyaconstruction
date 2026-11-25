import Link from "next/link";
import styles from "./careers.module.css";

const links = [
  { href: "/careers", label: "Careers home" },
  { href: "/careers/graduate-academy", label: "Graduate Academy" },
  { href: "/careers/apprenticeships", label: "Apprenticeships and trainees" },
  { href: "/careers/experienced", label: "Experienced roles" },
  { href: "/careers/vacancies", label: "Vacancies" },
  { href: "/careers/how-we-recruit", label: "How we recruit" },
  { href: "/careers/inclusion", label: "Inclusion and support" },
  { href: "/careers/talent-pool", label: "Talent pool" },
];

/** Section navigation for the careers pages. */
export function CareersNav({ current }: { current: string }) {
  return (
    <nav className={styles.subnav} aria-label="Careers section">
      <div className="container">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={current === l.href ? "page" : undefined}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
