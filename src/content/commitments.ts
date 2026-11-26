/**
 * Spec section 7b: the four reasons to choose us (on every company page, in
 * this order) and the six published commitments. Wording from the Phase 1 copy
 * deck. Commitments confirmed by Justin, 26 Nov 2026.
 */
export const reasons = [
  {
    title: "Senior from day one.",
    text: "Every appointment is led by a chartered professional, not handed to a junior. Our founder brings 14+ years on data centres, grid, offshore wind and rail.",
  },
  { title: "You see everything.", text: "Live cost, programme and risk in CONSTRUX, and a written report every week. No surprises at month end." },
  { title: "Solved in the model, not on site.", text: "BIM-led delivery to ISO 19650. Clashes are found on screen, before they cost you money on site." },
  {
    title: "A supply chain that turns up.",
    text: "Every subcontractor vetted, two per critical trade, paid in 30 days — so the best firms put our jobs first.",
  },
];

/** [before, bold, after] */
export const commitments: [string, string, string][] = [
  ["A reply within ", "one working day", "."],
  ["A fixed-fee proposal within ", "five working days", "."],
  ["A ", "named director", " accountable for your project."],
  ["A written progress report ", "every week", "."],
  ["Subcontractors paid within ", "30 days", "."],
  ["", "No claim we cannot evidence.", ""],
];
