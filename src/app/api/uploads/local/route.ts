import { NextResponse, type NextRequest } from "next/server";
import { usesS3, writeObject } from "@/lib/forms/blob";
import { contentTypeFor } from "@/lib/forms/upload-rules";
import { decodeTicket } from "@/lib/forms/uploads";

/**
 * Development stand-in for the signed S3 PUT: accepts the file body for a
 * valid ticket and writes it to UPLOAD_DIR/incoming. Disabled when S3 is set.
 */
export async function PUT(req: NextRequest) {
  if (usesS3() || process.env.VERCEL) return new NextResponse("Not found", { status: 404 });
  const t = decodeTicket(req.nextUrl.searchParams.get("t") ?? "");
  if (!t) return new NextResponse("Ticket expired", { status: 403 });
  if (req.headers.get("content-type") !== contentTypeFor(t.kind, t.name)) return new NextResponse("Wrong content type", { status: 400 });
  const body = Buffer.from(await req.arrayBuffer());
  if (body.length !== t.size) return new NextResponse("Wrong size", { status: 400 });
  await writeObject("incoming", t.id, body, contentTypeFor(t.kind, t.name)!);
  return new NextResponse(null, { status: 200 });
}
