import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CookieConsent } from "@/components/CookieConsent";
import { Enhancements } from "@/components/Enhancements";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema } from "@/lib/schema";
import { siteUrl } from "@/lib/cms";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Nseya Group Construction", template: "%s | Nseya Group" },
  description: "Birmingham construction group: Nseya Consultancy, ETABLIX site services and Nseya Construction. Trading from 2027.",
  openGraph: { siteName: "Nseya Group Construction", locale: "en_GB", type: "website" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0e2a3b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body data-company="group">
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <Enhancements />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
