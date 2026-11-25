import { NextResponse, type NextRequest } from "next/server";
import { domains } from "@/content/settings";

/**
 * 301 redirects from the group's other domains (nseyagroup.co.uk, nseya.uk,
 * nseyagroupe.com and the www hosts) to https://nseyagroup.com, keeping the
 * path and query (decision D1). These can also be set at the load balancer;
 * this keeps them working if DNS points the extra domains at the app.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (domains.redirects.includes(host)) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${domains.canonical}`);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = { matcher: "/((?!_next/static|_next/image).*)" };
