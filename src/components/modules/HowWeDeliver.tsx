"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HowWeDeliver.module.css";

const steps = [
  {
    title: "One accountable team leads every job",
    text: "Our own project managers and site supervisors plan the work, manage safety and answer to the client. You deal with one team, not a chain of firms.",
  },
  {
    title: "About 80% of the work is done by a vetted supply chain",
    text: "Specialist subcontractors and suppliers deliver most of the work. Each one is checked before it is approved: insurance, health and safety evidence, accreditations and Companies House status.",
    note: "Group plan",
  },
  {
    title: "Everyone works in one system",
    text: "Every subcontractor works in CONSTRUX or VERYX, whichever the project uses. Drawings, daily diaries, inspections and payment applications all go through it.",
  },
  {
    title: "The client sees the same data we do",
    text: "Progress, cost and risk are reported from the same records the site team uses, so the monthly report matches what is happening on site.",
  },
];

/**
 * "How we deliver" scroll story (section 7a). The diagram builds up as each
 * step scrolls into view. The steps are ordinary text, so screen readers and
 * visitors without JavaScript get the same content; the diagram is decorative.
 */
export function HowWeDeliver() {
  const [active, setActive] = useState(steps.length);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(1);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive((a) => Math.max(a, Number((e.target as HTMLElement).dataset.step)));
        }
      },
      { rootMargin: "-35% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.story} data-active={active}>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.title} data-step={i + 1} ref={(el) => { refs.current[i] = el; }} className={active >= i + 1 ? styles.on : undefined}>
            <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            {s.note && <span className="stat__kind">{s.note}</span>}
          </li>
        ))}
      </ol>
      <div className={styles.sticky}>
        <svg viewBox="0 0 420 420" className={styles.svg} aria-hidden="true" focusable="false">
          {/* Step 4: client */}
          <g className={styles.layer} data-on={active >= 4 || undefined}>
            <rect x="140" y="16" width="140" height="44" />
            <text x="210" y="43" textAnchor="middle">CLIENT</text>
            <line x1="210" y1="60" x2="210" y2="100" className={styles.flow} />
            <text x="218" y="86" className={styles.small}>Reports</text>
          </g>
          {/* Step 1: team */}
          <g className={styles.layer} data-on={active >= 1 || undefined}>
            <rect x="110" y="100" width="200" height="60" className={styles.team} />
            <text x="210" y="126" textAnchor="middle">NSEYA TEAM</text>
            <text x="210" y="146" textAnchor="middle" className={styles.small}>Managers · supervisors · HSEQ</text>
          </g>
          {/* Step 2: supply chain */}
          <g className={styles.layer} data-on={active >= 2 || undefined}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1="210" y1="160" x2={42 + i * 84} y2="230" className={styles.thinLine} />
                <rect x={12 + i * 84} y="230" width="60" height="44" />
                <text x={42 + i * 84} y="256" textAnchor="middle" className={styles.small}>{["Civils", "M&E", "HVAC", "Cable", "Plant"][i]}</text>
              </g>
            ))}
            <text x="210" y="300" textAnchor="middle" className={styles.small}>VETTED SUPPLY CHAIN · ~80% OF WORK</text>
          </g>
          {/* Step 3: platform */}
          <g className={styles.layer} data-on={active >= 3 || undefined}>
            <rect x="12" y="330" width="396" height="40" className={styles.platform} />
            <text x="210" y="355" textAnchor="middle" className={styles.platformText}>CONSTRUX · VERYX</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={42 + i * 84} y1="274" x2={42 + i * 84} y2="330" className={styles.flow} />
            ))}
            <path d="M408 350 H414 V130 H310" className={styles.flow} />
          </g>
        </svg>
        <p className="illustrative">Diagram · how the group delivers a project</p>
      </div>
    </div>
  );
}
