/**
 * Engineering-style line drawings for the company heroes (section 7a).
 * Drawn in code, traced in on load, labelled "Illustrative".
 */
type Kind = "consultancy" | "etablix" | "construction";

const meta: Record<Kind, { dwg: string; title: string; desc: string }> = {
  consultancy: {
    dwg: "DWG NGC-C01",
    title: "Planned and earned value curves",
    desc: "Illustrative chart: a planned-value S-curve rising over twelve months, with an earned-value line tracking slightly below it to month seven and a dashed forecast to completion.",
  },
  etablix: {
    dwg: "DWG NGC-E01",
    title: "Site compound plan",
    desc: "Illustrative plan of a construction site compound: a fenced boundary with a gated entrance, a one-way site road, office and welfare cabins in two rows, a drying room, a canteen, a car park and a generator with fuel store.",
  },
  construction: {
    dwg: "DWG NGC-K01",
    title: "Cable route and joint bay section",
    desc: "Illustrative cross-section of an underground cable route: a trench below ground level with three ducts in trefoil, cable tile and warning tape above, backfill layers, and a joint bay next to a substation fence line.",
  },
};

export function CompanyDrawing({ kind }: { kind: Kind }) {
  const m = meta[kind];
  const id = `dwg-${kind}`;
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox="0 0 480 320"
        className="draw draw-in hero__drawing"
        role="img"
        aria-labelledby={`${id}-t ${id}-d`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        style={{ width: "100%", maxWidth: 520 }}
      >
        <title id={`${id}-t`}>{`${m.title} (illustrative)`}</title>
        <desc id={`${id}-d`}>{m.desc}</desc>
        <rect x="1" y="1" width="478" height="318" data-draw opacity="0.6" />
        {kind === "consultancy" && <Consultancy />}
        {kind === "etablix" && <Etablix />}
        {kind === "construction" && <Construction />}
        {/* title block */}
        <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" stroke="none">
          <text x="306" y="296">{m.dwg}</text>
          <text x="306" y="309">ILLUSTRATIVE · NOT TO SCALE</text>
        </g>
        <path d="M298 284h181M298 284v35" data-draw opacity="0.6" />
      </svg>
    </figure>
  );
}

function Consultancy() {
  const x = (m: number) => 50 + m * 33;
  const planned = [0, 2, 5, 10, 18, 30, 44, 58, 70, 80, 88, 94, 97].map((p, i) => `${x(i)},${250 - p * 2.1}`).join(" ");
  const earned = [0, 2, 4, 9, 16, 26, 38, 50].map((p, i) => `${x(i)},${250 - p * 2.1}`).join(" ");
  const forecast = [50, 61, 72, 81, 89, 95].map((p, i) => `${x(i + 7)},${250 - p * 2.1}`).join(" ");
  return (
    <g>
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={x(i)} y1="40" x2={x(i)} y2="250" opacity="0.18" />
      ))}
      {[0, 25, 50, 75, 100].map((p) => (
        <line key={p} x1="50" y1={250 - p * 2.1} x2="446" y2={250 - p * 2.1} opacity="0.18" />
      ))}
      <path d="M50 30V250H450" data-draw strokeWidth="1.5" />
      <polyline points={planned} data-draw strokeWidth="2" style={{ ["--delay" as string]: "0.4s" }} />
      <polyline points={earned} data-draw stroke="var(--accent-on-dark)" strokeWidth="2.5" style={{ ["--delay" as string]: "0.9s" }} />
      <polyline points={forecast} data-draw stroke="var(--accent-on-dark)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />
      <line x1={x(7)} y1="40" x2={x(7)} y2="250" stroke="var(--accent-on-dark)" strokeDasharray="2 4" />
      <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" stroke="none">
        <text x="56" y="44">% COMPLETE</text>
        <text x={x(7) + 4} y="54">DATA DATE · M7</text>
        <text x="380" y="266">MONTH 12</text>
        <text x="300" y="88">PV</text>
        <text x="238" y="160" fill="var(--accent-on-dark)">EV</text>
      </g>
    </g>
  );
}

function Etablix() {
  return (
    <g>
      {/* fence */}
      <path d="M30 30H450V270H30V170" data-draw strokeDasharray="8 4" strokeWidth="1.5" />
      <path d="M30 130V30" data-draw strokeDasharray="8 4" strokeWidth="1.5" />
      {/* gate & road */}
      <path d="M0 140H30M0 160H30" data-draw />
      <path d="M30 140H360V100H400V250H90V160H30" data-draw opacity="0.9" />
      <path d="M60 150H340M110 175H380" data-draw strokeDasharray="10 8" opacity="0.5" />
      {/* cabins row 1 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`a${i}`} x={60 + i * 58} y="52" width="50" height="34" data-draw stroke="var(--accent-on-dark)" strokeWidth="1.75" style={{ ["--delay" as string]: `${0.3 + i * 0.12}s` }} />
      ))}
      {/* cabins row 2 */}
      {[0, 1, 2].map((i) => (
        <rect key={`b${i}`} x={120 + i * 76} y="192" width="68" height="40" data-draw stroke="var(--accent-on-dark)" strokeWidth="1.75" style={{ ["--delay" as string]: `${0.9 + i * 0.12}s` }} />
      ))}
      {/* car park */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`p${i}`} x1="420" y1={60 + i * 14} x2="440" y2={60 + i * 14} opacity="0.7" />
      ))}
      <circle cx="420" cy="225" r="12" data-draw />
      <g fontFamily="var(--font-mono)" fontSize="8.5" fill="currentColor" stroke="none">
        <text x="64" y="72">OFFICE</text>
        <text x="122" y="72">OFFICE</text>
        <text x="180" y="72">MEETING</text>
        <text x="238" y="72">DRYING</text>
        <text x="296" y="72">WC</text>
        <text x="126" y="216">CANTEEN</text>
        <text x="202" y="216">WELFARE</text>
        <text x="278" y="216">FIRST AID</text>
        <text x="406" y="52">PARKING</text>
        <text x="396" y="248">GEN</text>
        <text x="4" y="132">GATE</text>
        <text x="200" y="146">ONE-WAY SITE ROAD</text>
      </g>
    </g>
  );
}

function Construction() {
  return (
    <g>
      {/* ground */}
      <path d="M20 90H150M290 90H460" data-draw strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={24 + i * 10} y1="90" x2={18 + i * 10} y2="98" opacity="0.6" />
      ))}
      {/* trench */}
      <path d="M150 90V250H290V90" data-draw strokeWidth="1.75" />
      <line x1="150" y1="150" x2="290" y2="150" strokeDasharray="4 4" opacity="0.6" />
      <line x1="150" y1="175" x2="290" y2="175" stroke="var(--accent-on-dark)" strokeWidth="2" data-draw style={{ ["--delay" as string]: "0.6s" }} />
      <line x1="160" y1="125" x2="280" y2="125" strokeDasharray="2 3" stroke="var(--accent-on-dark)" />
      {/* ducts trefoil */}
      <circle cx="206" cy="222" r="14" data-draw stroke="var(--accent-on-dark)" strokeWidth="2" style={{ ["--delay" as string]: "1s" }} />
      <circle cx="234" cy="222" r="14" data-draw stroke="var(--accent-on-dark)" strokeWidth="2" style={{ ["--delay" as string]: "1.1s" }} />
      <circle cx="220" cy="198" r="14" data-draw stroke="var(--accent-on-dark)" strokeWidth="2" style={{ ["--delay" as string]: "1.2s" }} />
      {/* dimension */}
      <path d="M120 90V250M114 90H126M114 250H126" data-draw opacity="0.8" />
      <path d="M150 268H290M150 262V274M290 262V274" data-draw opacity="0.8" />
      {/* substation fence */}
      <path d="M340 90V40M360 90V40M380 90V40M400 90V40M420 90V40M440 90V40M330 50H450" data-draw opacity="0.7" />
      <g fontFamily="var(--font-mono)" fontSize="8.5" fill="currentColor" stroke="none">
        <text x="300" y="128">WARNING TAPE</text>
        <text x="300" y="178">CABLE TILE</text>
        <text x="300" y="212">DUCTS IN TREFOIL</text>
        <text x="300" y="224">33KV / 132KV</text>
        <text x="40" y="174" transform="rotate(-90 100 170)">MIN COVER</text>
        <text x="196" y="286">TRENCH WIDTH</text>
        <text x="342" y="32">SUBSTATION FENCE LINE</text>
        <text x="24" y="82">GROUND LEVEL</text>
      </g>
    </g>
  );
}
