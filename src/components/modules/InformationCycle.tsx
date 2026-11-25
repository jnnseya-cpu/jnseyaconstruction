import styles from "./InformationCycle.module.css";

/**
 * ISO 19650 information-delivery cycle (PG-03), drawn in code. The ring shows
 * the eight information-management activities of BS EN ISO 19650-2; the centre
 * shows the common data environment states of BS EN ISO 19650-1. Illustrative.
 */
const activities = [
  { label: ["Assessment", "and need"], clause: "5.1" },
  { label: ["Invitation", "to tender"], clause: "5.2" },
  { label: ["Tender", "response"], clause: "5.3" },
  { label: ["Appointment"], clause: "5.4" },
  { label: ["Mobilisation"], clause: "5.5" },
  { label: ["Collaborative", "production"], clause: "5.6" },
  { label: ["Information", "model delivery"], clause: "5.7" },
  { label: ["Project", "close-out"], clause: "5.8" },
];

const CX = 320;
const CY = 236;
const RX = 238;
const RY = 172;
const W = 124;
const H = 46;

const pos = (i: number, offset = 0) => {
  const a = -Math.PI / 2 + ((i + offset) * 2 * Math.PI) / activities.length;
  return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a };
};

/** Arrowhead on the ring half-way between two activities, pointing clockwise. */
function Arrow({ i }: { i: number }) {
  const { x, y, a } = pos(i, 0.5);
  // Tangent of the ellipse at angle a.
  const tx = -RX * Math.sin(a);
  const ty = RY * Math.cos(a);
  const deg = (Math.atan2(ty, tx) * 180) / Math.PI;
  return <polygon className={styles.arrow} points="7,0 -5,-5 -5,5" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`} />;
}

const states = [
  { name: "Work in progress", x: 222, y: 186 },
  { name: "Shared", x: 330, y: 186 },
  { name: "Published", x: 330, y: 250, published: true },
  { name: "Archived", x: 222, y: 250 },
];

export function InformationCycle() {
  return (
    <figure className={styles.figure} aria-labelledby="iso19650-caption">
      <div className={styles.scroll}>
        <svg viewBox="0 0 640 470" className={`${styles.svg} draw draw-in`} role="img" aria-labelledby="iso19650-t iso19650-d">
          <title id="iso19650-t">ISO 19650 information-delivery cycle (illustrative)</title>
          <desc id="iso19650-d">
            A ring of eight activities, clockwise: assessment and need, invitation to tender, tender response, appointment, mobilisation,
            collaborative production of information, information model delivery and project close-out. In the centre, the common data environment
            moves information from work in progress to shared, published and archived.
          </desc>

          <ellipse className={styles.ring} cx={CX} cy={CY} rx={RX} ry={RY} data-draw />
          {activities.map((_, i) => <Arrow key={i} i={i} />)}

          <text className={styles.phase} x={CX + 150} y={28} textAnchor="middle">APPOINTMENT ▸</text>
          <text className={styles.phase} x={CX - 150} y={458} textAnchor="middle">◂ DELIVERY</text>

          {/* Common data environment */}
          <rect className={styles.cde} x={204} y={158} width={232} height={150} />
          <text className={styles.phase} x={CX} y={176} textAnchor="middle">COMMON DATA ENVIRONMENT</text>
          {states.map((s) => (
            <g key={s.name}>
              <rect className={s.published ? `${styles.state} ${styles.statePublished}` : styles.state} x={s.x} y={s.y} width={88} height={30} />
              <text className={styles.lbl} x={s.x + 44} y={s.y + 19} textAnchor="middle">{s.name === "Work in progress" ? "WIP" : s.name}</text>
            </g>
          ))}
          <path className={styles.flow} d="M310 201h18M374 216v32M328 265h-18" data-draw />
          <polygon className={styles.arrow} points="330,201 324,198 324,204" />
          <polygon className={styles.arrow} points="374,250 371,244 377,244" />
          <polygon className={styles.arrow} points="308,265 314,262 314,268" />
          <text className={styles.gate} x={CX} y={294} textAnchor="middle">check · review · approve · authorise</text>

          {/* Activities */}
          {activities.map((act, i) => {
            const { x, y } = pos(i);
            return (
              <g key={act.clause}>
                <rect className={i < 4 ? `${styles.node} ${styles.nodeAppoint}` : styles.node} x={x - W / 2} y={y - H / 2} width={W} height={H} />
                <text className={styles.num} x={x - W / 2 + 8} y={y - H / 2 + 14}>{act.clause}</text>
                {act.label.map((line, j) => (
                  <text key={line} className={styles.lbl} x={x} y={y + (act.label.length === 1 ? 9 : 3 + j * 13)} textAnchor="middle">{line}</text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption id="iso19650-caption" className={styles.caption}>
        <span>DWG NGC-C02</span>
        <span>Information-delivery cycle · BS EN ISO 19650-1 and -2</span>
        <span>Illustrative</span>
      </figcaption>
      <div className={styles.desc}>
        <h4>The cycle in words</h4>
        <ol>
          <li>Assessment and need: the client sets out what information it needs and when.</li>
          <li>Invitation to tender: the requirements go out with the tender.</li>
          <li>Tender response: each bidder shows how it will deliver the information.</li>
          <li>Appointment: the BIM execution plan and delivery plan become part of the contract.</li>
          <li>Mobilisation: the common data environment, standards and methods are set up and tested.</li>
          <li>Collaborative production: teams create information and share it through the common data environment.</li>
          <li>Information model delivery: each exchange is checked against the requirements before it is accepted.</li>
          <li>Project close-out: the information model is handed over for the client to run the asset.</li>
        </ol>
        <p>
          Inside the common data environment, every file moves from work in progress to shared once checked, to published once authorised, and to archived
          when superseded. Clause numbers refer to BS EN ISO 19650-2.
        </p>
      </div>
    </figure>
  );
}
