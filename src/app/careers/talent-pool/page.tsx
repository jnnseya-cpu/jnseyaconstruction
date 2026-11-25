import type { Metadata } from "next";
import { CareersNav } from "@/components/careers/CareersNav";
import { TalentPoolForm } from "@/components/forms/TalentPoolForm";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Join our talent pool",
  description: "No suitable role open? Register your interest and we will contact you when a graduate, apprentice, trainee or experienced role opens.",
  alternates: { canonical: "/careers/talent-pool" },
};

export default function TalentPoolPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Talent pool", href: "/careers/talent-pool" }]}
        label="Talent pool"
        title="Tell us what you are looking for"
        lede="No suitable role open right now? Register your interest. We keep your details for 12 months and email you a link to keep them longer."
      />
      <CareersNav current="/careers/talent-pool" />
      <section className="section">
        <div className="container">
          <TalentPoolForm />
        </div>
      </section>
    </div>
  );
}
