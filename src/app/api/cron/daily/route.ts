import { NextResponse } from "next/server";
import { cronAuthorised } from "@/lib/suppliers/auth";
import { runDaily } from "@/lib/suppliers/jobs";

export const dynamic = "force-dynamic";

/** Called once a day by Cloud Scheduler with `Authorization: Bearer $CRON_SECRET`. */
async function handle(req: Request) {
  if (!cronAuthorised(req.headers.get("authorization"))) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runDaily()) });
  } catch (err) {
    console.error(JSON.stringify({ event: "daily_job_failed", error: err instanceof Error ? err.name : "unknown" }));
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
