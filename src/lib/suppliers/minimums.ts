/**
 * Group minimums for supplier approval (spec section 5b). The single editable
 * source: change a figure here and the Suppliers page, the application checks
 * and the daily job all follow. (Moves to a CMS setting with WEB-03.)
 */
export const minimums = {
  employersLiability: 10_000_000,
  publicLiability: 5_000_000,
  /** Public liability for power and highway work. */
  publicLiabilityPowerHighway: 10_000_000,
  /** Professional indemnity for designers and consultants. */
  professionalIndemnityDesigners: 1_000_000,
  /** Credit check threshold for subcontracts (review stage). */
  creditCheckOver: 25_000,
} as const;

export interface InsuranceCover {
  limit?: number;
  expiry?: string;
}

export interface InsuranceSet {
  el?: InsuranceCover;
  pl?: InsuranceCover;
  pi?: InsuranceCover;
  cw?: InsuranceCover;
}

export interface MinimumsResult {
  key: "el" | "pl" | "pi";
  label: string;
  required: number;
  actual?: number;
  ok: boolean;
}

export const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

/** Compare declared insurance limits with the group minimums. */
export function checkMinimums(ins: InsuranceSet, opts: { powerOrHighway: boolean; designer: boolean }): MinimumsResult[] {
  const out: MinimumsResult[] = [
    { key: "el", label: "Employer's liability", required: minimums.employersLiability, actual: ins.el?.limit, ok: false },
    {
      key: "pl",
      label: opts.powerOrHighway ? "Public liability (power and highway work)" : "Public liability",
      required: opts.powerOrHighway ? minimums.publicLiabilityPowerHighway : minimums.publicLiability,
      actual: ins.pl?.limit,
      ok: false,
    },
  ];
  if (opts.designer) {
    out.push({ key: "pi", label: "Professional indemnity", required: minimums.professionalIndemnityDesigners, actual: ins.pi?.limit, ok: false });
  }
  for (const r of out) r.ok = typeof r.actual === "number" && r.actual >= r.required;
  return out;
}
