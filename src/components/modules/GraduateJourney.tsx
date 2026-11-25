import styles from "./GraduateJourney.module.css";

/**
 * Graduate Academy journey (section 7a module, CR-02). Month-by-month path
 * from day one towards chartership. Plain HTML list: works on a phone and
 * with no animation at all; the reveal is a progressive extra.
 *
 * TO CONFIRM (Justin): rotation order, month of each course, and which
 * company hosts each rotation. This is the planned programme for the first
 * intake in 2027, not a record of past cohorts.
 */

type Step = { month: string; title: string; text: string; tag?: "Course" | "Review" | "Membership" };
type Rotation = { id: string; name: string; months: string; company: "consultancy" | "etablix" | "construction"; focus: string; steps: Step[] };

const rotations: Rotation[] = [
  {
    id: "r1",
    name: "Rotation 1: Consultancy",
    months: "Months 1 to 8",
    company: "consultancy",
    focus: "Project controls, cost and programme",
    steps: [
      { month: "Week 1", title: "Induction and your mentor", text: "Meet your named mentor. Company induction, safety basics and your two-year plan." },
      { month: "Month 1", title: "CSCS card and site safety", text: "Health, safety and environment test, CSCS card and site safety training, all paid for.", tag: "Course" },
      { month: "Month 1", title: "CONSTRUX and VERYX training", text: "Learn the systems the group runs projects and the business on." },
      { month: "Month 3", title: "First review", text: "A one-to-one with your mentor and manager on what is going well and what to work on.", tag: "Review" },
      { month: "Month 6", title: "SSSTS", text: "Site Supervisors' Safety Training Scheme, the two-day CITB course for new supervisors.", tag: "Course" },
    ],
  },
  {
    id: "r2",
    name: "Rotation 2: ETABLIX",
    months: "Months 9 to 16",
    company: "etablix",
    focus: "Site services, logistics and workforce welfare",
    steps: [
      { month: "Month 9", title: "Move to site services", text: "Help plan and run cabins, welfare, security and cleaning on live sites." },
      { month: "Month 12", title: "Join a professional body", text: "Start student or trainee membership of CIOB, RICS, ICE or IET, depending on your path.", tag: "Membership" },
      { month: "Month 12", title: "Year one review", text: "Agree your second-year goals and the route to chartership that suits you.", tag: "Review" },
    ],
  },
  {
    id: "r3",
    name: "Rotation 3: Construction",
    months: "Months 17 to 24",
    company: "construction",
    focus: "Buildings, power and digital projects",
    steps: [
      { month: "Month 17", title: "Site team", text: "Work with the site manager on a building, power or data-centre project." },
      { month: "Month 20", title: "SMSTS", text: "Site Management Safety Training Scheme, the five-day CITB course for site managers.", tag: "Course" },
      { month: "Month 24", title: "Finish the programme", text: "Final review and a permanent role in the team that fits you best.", tag: "Review" },
    ],
  },
];

export function GraduateJourney() {
  return (
    <div className={styles.journey}>
      <ol className={styles.bar} aria-label="Three rotations over 24 months">
        {rotations.map((r) => (
          <li key={r.id} data-company={r.company}>
            <a href={`#${r.id}`}>
              <span className={styles.barMonths}>{r.months}</span>
              <span className={styles.barName}>{r.name.replace(/^Rotation \d: /, "")}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className={styles.rotations}>
        {rotations.map((r) => (
          <section key={r.id} id={r.id} className={styles.rotation} data-company={r.company} aria-labelledby={`${r.id}-title`} data-reveal>
            <header className={styles.rotationHead}>
              <p className={styles.months}>{r.months}</p>
              <h3 id={`${r.id}-title`}>{r.name}</h3>
              <p className="muted small">{r.focus}</p>
            </header>
            <ol className={styles.steps}>
              {r.steps.map((s) => (
                <li key={`${s.month}-${s.title}`}>
                  <span className={styles.month}>{s.month}</span>
                  <div>
                    <h4>
                      {s.title} {s.tag && <span className="tag tag--accent">{s.tag}</span>}
                    </h4>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
        <section className={`${styles.rotation} ${styles.after}`} aria-labelledby="after-title" data-reveal>
          <header className={styles.rotationHead}>
            <p className={styles.months}>Month 24 onwards</p>
            <h3 id="after-title">Towards chartership</h3>
          </header>
          <p>
            Keep building the evidence you need for chartered membership with your professional body (MCIOB, MRICS, ICE or IET), with your
            mentor&apos;s support. Chartership usually takes several more years of practice after the programme.
          </p>
        </section>
      </div>
      <p className="illustrative">Planned programme for the first intake. Course timings may change.</p>
    </div>
  );
}
