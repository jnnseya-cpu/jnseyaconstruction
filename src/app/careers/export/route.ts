import { timingSafeEqual } from "node:crypto";
import { applicationsCsv } from "@/lib/forms/careers-admin";

export const dynamic = "force-dynamic";

function authorised(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Daily CSV export of applications (section 5a: "CSV export until then"). */
export async function GET(req: Request) {
  if (!authorised(req)) return new Response("Not found", { status: 404 });
  const csv = await applicationsCsv();
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
