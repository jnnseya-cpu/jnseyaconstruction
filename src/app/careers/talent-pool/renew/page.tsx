import type { Metadata } from "next";
import { TokenActionForm } from "@/components/careers/TokenActionForm";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Keep my talent pool details", robots: { index: false } };

export default async function RenewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await searchParams).token;
  return (
    <div data-company="group">
      <PageHero crumbs={[{ name: "Careers", href: "/careers" }, { name: "Talent pool", href: "/careers/talent-pool" }]} title="Keep your details for another 12 months" />
      <section className="section">
        <div className="container">
          <TokenActionForm kind="renew" token={typeof token === "string" ? token : ""} label="Keep my details" />
        </div>
      </section>
    </div>
  );
}
