"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * PECR cookie consent. No non-essential cookies before consent; "Reject all"
 * is as easy as "Accept all". Plausible (cookieless) runs without consent;
 * GA4 loads only after "Accept all". The choice is kept in a first-party
 * cookie (strictly necessary) for 12 months.
 */
const COOKIE = "nseya_consent";

function readConsent(): "accepted" | "rejected" | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(accepted|rejected)`));
  return (m?.[1] as "accepted" | "rejected") ?? null;
}

export function setConsent(v: "accepted" | "rejected") {
  document.cookie = `${COOKIE}=${v}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent("nseya-consent", { detail: v }));
}

export function CookieConsent() {
  const [consent, setState] = useState<"accepted" | "rejected" | null | "unknown">("unknown");
  const ga = process.env.NEXT_PUBLIC_GA4_ID;
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  useEffect(() => {
    setState(readConsent());
    const on = (e: Event) => setState((e as CustomEvent).detail);
    const reopen = () => setState(null);
    window.addEventListener("nseya-consent", on);
    window.addEventListener("nseya-consent-reopen", reopen);
    return () => {
      window.removeEventListener("nseya-consent", on);
      window.removeEventListener("nseya-consent-reopen", reopen);
    };
  }, []);

  return (
    <>
      {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      {ga && consent === "accepted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {consent === null && (
        <div className="cookie-banner" role="region" aria-label="Cookie choices">
          <div className="container cookie-banner__inner">
            <p>We use cookies only to understand which pages help people. Nothing is shared or sold.</p>
            <div className="btn-row">
              <button type="button" className="btn btn--navy" onClick={() => setConsent("accepted")}>Accept</button>
              <button type="button" className="btn btn--navy" onClick={() => setConsent("rejected")}>Reject</button>
              <Link className="btn btn--ghost" href="/cookies">Settings</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ReopenCookieChoices() {
  return (
    <button type="button" className="btn btn--ghost" onClick={() => window.dispatchEvent(new Event("nseya-consent-reopen"))}>
      Change cookie choices
    </button>
  );
}
