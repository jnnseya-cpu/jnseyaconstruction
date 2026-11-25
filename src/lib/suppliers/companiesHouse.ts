import "server-only";

export interface CompanyProfile {
  name: string;
  number: string;
  status: string;
  address: string;
}

/**
 * Companies House public data API. Returns null when the service is not
 * configured or unreachable (callers fall back to manual entry), and
 * "not-found" for an unknown number.
 */
export async function lookupCompany(number: string): Promise<CompanyProfile | "not-found" | null> {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.company-information.service.gov.uk/company/${encodeURIComponent(number)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (res.status === 404) return "not-found";
    if (!res.ok) return null;
    const j = (await res.json()) as {
      company_name?: string;
      company_number?: string;
      company_status?: string;
      registered_office_address?: Record<string, string | undefined>;
    };
    const a = j.registered_office_address ?? {};
    const address = [a.premises, a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code].filter(Boolean).join(", ");
    return { name: j.company_name ?? "", number: j.company_number ?? number, status: j.company_status ?? "unknown", address };
  } catch {
    return null;
  }
}
