import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Apply to Nseya Group Construction",
  description: "Apply to the Graduate Academy, an apprenticeship or a trainee role. About five minutes on a phone. No CV needed.",
  alternates: { canonical: "/careers/apply" },
};

const roleFor: Record<string, string> = {
  graduate: "Nseya Graduate Academy",
  apprentice: "Apprenticeship",
  trainee: "Trainee role",
  experienced: "Experienced role",
};

export default async function GeneralApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const route = typeof sp.route === "string" && roleFor[sp.route] ? sp.route : undefined;
  const startRoute = sp.mode === "no-cv" ? "no-cv" : "cv";
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Apply", href: "/careers/apply" }]}
        label="Apply"
        title={route ? `Apply: ${roleFor[route]}` : "Apply to work with us"}
        lede="About five minutes. You do not need a CV. What you type is saved on this device if you need to stop and come back."
      />
      <section className="section">
        <div className="container">
          <ApplicationForm role={route ? roleFor[route] : undefined} vacancySlug={route ? `general-${route}` : "general"} graduate={route === "graduate"} startRoute={startRoute} />
        </div>
      </section>
    </div>
  );
}
