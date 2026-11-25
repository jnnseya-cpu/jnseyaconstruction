import { cronAuthorised } from "@/lib/suppliers/auth";
import { construxCsv } from "@/lib/suppliers/export";
import { supplierRecords } from "@/lib/suppliers/jobs";

export const dynamic = "force-dynamic";

/** CONSTRUX supplier records as CSV (stand-in for the CONSTRUX supplier API). */
export async function GET(req: Request) {
  if (!cronAuthorised(req.headers.get("authorization"))) return new Response("Unauthorised", { status: 401 });
  const csv = construxCsv((await supplierRecords()).map((r) => ({ ref: r.ref, data: r.data })));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="construx-suppliers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
