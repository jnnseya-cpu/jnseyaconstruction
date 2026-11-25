import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { VerifyForm } from "@/components/suppliers/AccountForms";

export const metadata: Metadata = { title: "Sign in to your supplier account", description: "Confirm your one-time sign-in link.", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <PageHero label="Supplier account" title="Confirm sign in" crumbs={[{ name: "Suppliers", href: "/suppliers" }, { name: "Supplier account", href: "/suppliers/account" }]} />
      <section className="section section--tight">
        <div className="container grid">
          <div className="span-7">
            {token ? (
              <>
                <p>Select the button to finish signing in. The link works once.</p>
                <VerifyForm token={token} />
              </>
            ) : (
              <p>This sign-in link is not complete. <Link href="/suppliers/account">Ask for a new link</Link>.</p>
            )}
            <p style={{ marginTop: 24 }}><Link href="/suppliers/account">Ask for a new link</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
