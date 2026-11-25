import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribe } from "@/lib/forms/newsletter";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await unsubscribe(token) : false;
  return (
    <section className="section">
      <div className="container">
        <h1>{ok ? "You are unsubscribed" : "We could not find that subscription"}</h1>
        <p>{ok ? "We have deleted your email address from our mailing list." : "It may already have been removed."}</p>
        <Link className="link-arrow" href="/">Back to the home page</Link>
      </div>
    </section>
  );
}
