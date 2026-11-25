import { NextResponse } from "next/server";
import { lookupCompany } from "@/lib/suppliers/companiesHouse";
import { normaliseCompanyNumber } from "@/lib/suppliers/rules";

export const dynamic = "force-dynamic";

/** Company lookup for the supplier application (step 1). 503 means "type the details in". */
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const n = normaliseCompanyNumber((await params).number);
  if (!n) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await lookupCompany(n);
  if (result === null) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  if (result === "not-found") return NextResponse.json({ error: "not-found" }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=300" } });
}
