import type { Metadata } from "next";
import Link from "next/link";
import { confirmSubscription } from "@/lib/forms/newsletter";

export const metadata: Metadata = { title: "Confirm subscription", robots: { index: false } };

export default async function Confirm({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await confirmSubscription(token) : false;
  return (
    <section className="section">
      <div className="container">
        <h1>{ok ? "You are subscribed" : "This link has expired"}</h1>
        <p>{ok ? "Thank you. You can unsubscribe from any email we send." : "Sign up again from the bottom of any page."}</p>
        <Link className="link-arrow" href="/">Back to the home page</Link>
      </div>
    </section>
  );
}
