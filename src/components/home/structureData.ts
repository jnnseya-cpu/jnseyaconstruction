import { getCompanies, getLegalEntity, getServices } from "@/lib/cms";
import type { StructureCompany } from "@/components/modules/GroupStructure";

/** Plain data for the client-side group structure explorer. */
export function structureCompanies(): StructureCompany[] {
  return getCompanies().map((c) => ({
    id: c.id,
    name: c.name,
    path: c.path,
    summary: c.summary,
    externalSite: c.externalSite,
    services: getServices(c.id).map((s) => ({ name: s.name, summary: s.summary })),
  }));
}

export const legalEntityName = () => {
  const e = getLegalEntity();
  return `${e.legalName} (${e.companyNumber})`;
};
