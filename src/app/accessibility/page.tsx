import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: "How accessible this website is, the standard we aim to meet (WCAG 2.2 AA), and how to report a problem.",
  alternates: { canonical: "/accessibility" },
};

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility statement" path="/accessibility" updated="2026-11-25" lede="We want everyone to be able to use this website, whatever device or assistive technology they use.">
      <h2>The standard we aim for</h2>
      <p>
        We aim to meet the Web Content Accessibility Guidelines (WCAG) version 2.2 at level AA. You should be able to:
      </p>
      <ul>
        <li>use the whole website with a keyboard alone, with a visible focus outline;</li>
        <li>use it with a screen reader such as NVDA, JAWS or VoiceOver;</li>
        <li>zoom to 400% without text spilling off the screen, and use it on a screen 320 pixels wide;</li>
        <li>turn off animation by switching on &quot;reduce motion&quot; on your device;</li>
        <li>fill in every form without a time limit, with errors explained beside each field.</li>
      </ul>
      <p>Every diagram and drawing has a text description.</p>

      <h2>How we test</h2>
      <p>
        We test every page with automated checks (axe) and by hand with a keyboard and screen reader before it goes live.
        This statement will be updated with the results of the full check before launch on 4 January 2027.
      </p>

      <h2>Known issues</h2>
      <p>We are not aware of any issues at the date above. If you find one, please tell us.</p>

      <h2>Report a problem</h2>
      <p>
        If something on this website does not work for you, or you need information in another format, use the <Link href="/contact">contact form</Link>.
        We reply within one working day and aim to fix problems within 10 working days.
      </p>
      <p>
        If you are not happy with our response, you can contact the Equality Advisory and Support Service (EASS) at{" "}
        <a href="https://www.equalityadvisoryservice.com/" rel="noopener">equalityadvisoryservice.com</a>.
      </p>
    </LegalPage>
  );
}
