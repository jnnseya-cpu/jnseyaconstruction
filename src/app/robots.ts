import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/cms";

export default function robots(): MetadataRoute.Robots {
  // Staging and preview builds must not be indexed.
  if (process.env.SITE_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/suppliers/account", "/newsletter/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
