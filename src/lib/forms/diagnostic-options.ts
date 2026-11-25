/* Options for FM-02. Kept out of diagnostic.ts because a "use server" module may export only async functions. */
export const projectTypes = [
  "energy-generation",
  "substation-grid",
  "data-centre",
  "infrastructure",
  "buildings",
  "housing",
  "other",
] as const;

export type ProjectType = (typeof projectTypes)[number];

export const projectTypeLabels: Record<ProjectType, string> = {
  "energy-generation": "Energy generation",
  "substation-grid": "Substation or grid connection",
  "data-centre": "Data centre",
  infrastructure: "Road, rail or other infrastructure",
  buildings: "Commercial or public buildings",
  housing: "Housing",
  other: "Something else",
};

export interface ScoreInput {
  workforcePeak: number;
  programmeMonths: number;
  remoteSite?: "yes" | "no" | "unsure";
  projectType: ProjectType;
  tradesNeeded?: string;
  startDate?: string;
}

/**
 * Best-fit score for FM-02, 0 to 6, one point per criterion. Stored on the
 * lead and sent to the ETABLIX inbox; never shown to the visitor.
 * TO CONFIRM: replace with the six criteria in the BD plan. These are
 * provisional criteria derived from the form fields.
 */
export function scoreDiagnostic(d: ScoreInput, now = new Date()) {
  const startWithin12Months = (() => {
    if (!d.startDate) return false;
    const parsed = Date.parse(/^\w+ \d{4}$/.test(d.startDate.trim()) ? `1 ${d.startDate}` : d.startDate);
    if (Number.isNaN(parsed)) return false;
    return (parsed - now.getTime()) / (30.44 * 86400_000) <= 12;
  })();
  const criteria = {
    workforcePeakAtLeast50: d.workforcePeak >= 50,
    programmeAtLeast6Months: d.programmeMonths >= 6,
    remoteOrGreenfieldSite: d.remoteSite === "yes",
    energyDataCentreOrInfrastructure: ["energy-generation", "substation-grid", "data-centre", "infrastructure"].includes(d.projectType),
    multipleServicesNeeded: (d.tradesNeeded ?? "").split(/[,;\n]| and /).filter((s) => s.trim().length > 1).length >= 2,
    startWithin12Months,
  };
  return { score: Object.values(criteria).filter(Boolean).length, criteria };
}
