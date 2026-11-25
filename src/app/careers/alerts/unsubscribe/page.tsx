import type { Metadata } from "next";
import { TokenActionForm } from "@/components/careers/TokenActionForm";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Stop job alerts", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await searchParams).token;
  return (
    <div data-company="group">
      <PageHero crumbs={[{ name: "Careers", href: "/careers" }, { name: "Vacancies", href: "/careers/vacancies" }]} title="Stop job alert emails" />
      <section className="section">
        <div className="container">
          <TokenActionForm kind="unsubscribe" token={typeof token === "string" ? token : ""} label="Stop job alerts" />
        </div>
      </section>
    </div>
  );
}
