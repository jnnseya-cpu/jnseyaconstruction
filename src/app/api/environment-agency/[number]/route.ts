import { NextResponse } from "next/server";
import { lookupWasteCarrier } from "@/lib/suppliers/environmentAgency";
import { normaliseWasteCarrierNumber } from "@/lib/suppliers/tickets";

export const dynamic = "force-dynamic";

/**
 * Waste carrier lookup for the supplier application (step 3) on the
 * Environment Agency public register. 503 means "carry on: we check it later".
 */
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const n = normaliseWasteCarrierNumber(decodeURIComponent((await params).number));
  if (!n) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await lookupWasteCarrier(n.number);
  if (result === null) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  if (result === "not-found") return NextResponse.json({ error: "not-found" }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=300" } });
}
