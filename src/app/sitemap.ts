import type { MetadataRoute } from "next";
import { getOpenVacancies, siteUrl } from "@/lib/cms";

export const revalidate = 3600;

const staticPaths = [
  "/", "/about", "/consultancy", "/etablix", "/construction", "/services", "/homeowners",
  "/careers", "/careers/graduate-academy", "/careers/apprenticeships", "/careers/experienced",
  "/careers/vacancies", "/careers/how-we-recruit", "/careers/inclusion", "/careers/talent-pool",
  "/suppliers", "/suppliers/apply", "/suppliers/code-and-policies",
  "/contact", "/privacy", "/cookies", "/terms", "/accessibility", "/modern-slavery",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...getOpenVacancies().map((v) => ({ url: `${base}/careers/vacancies/${v.slug}`, lastModified: v.postedDate, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
