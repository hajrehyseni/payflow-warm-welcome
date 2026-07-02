import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — PayFlow" },
      { name: "description", content: "How PayFlow uses cookies and similar technologies, and how you can control them." },
      { property: "og:title", content: "Cookie Policy — PayFlow" },
      { property: "og:description", content: "How PayFlow uses cookies and how to manage them." },
    ],
  }),
  component: CookiePage,
});

function CookiePage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="2 July 2026"
      intro="This Cookie Policy explains how Londonra Ltd uses cookies and similar technologies (such as local storage) on the PayFlow app and website. It should be read alongside our Privacy Policy."
    >
      <section>
        <h2>1. What are cookies?</h2>
        <p>
          Cookies are small text files that a website stores on your device. Similar technologies such as local
          storage work in the same way. They let sites remember your preferences, keep you signed in, and understand
          how the site is used.
        </p>
      </section>

      <section>
        <h2>2. The cookies we use</h2>

        <h3>Essential (always on)</h3>
        <p>Required for the Service to work. These cannot be turned off.</p>
        <ul>
          <li>Authentication and session tokens (keep you signed in).</li>
          <li>Local storage of your tracked shifts when you use PayFlow as a guest.</li>
          <li>Security cookies that prevent fraud and abuse.</li>
        </ul>

        <h3>Preference</h3>
        <p>Remember choices you have made, such as onboarding completion and UI settings.</p>

        <h3>Analytics (optional)</h3>
        <p>
          Help us understand how PayFlow is used so we can improve it. These are only set with your consent and are
          configured to collect aggregated, non-identifying data where possible.
        </p>

        <h3>Marketing</h3>
        <p>We do not currently use marketing or advertising cookies.</p>
      </section>

      <section>
        <h2>3. Third-party cookies</h2>
        <p>Some cookies may be set by trusted third parties who help us run the Service, including:</p>
        <ul>
          <li><strong>Stripe</strong> — fraud prevention and payment processing on business checkout pages.</li>
          <li><strong>Supabase / Cloudflare</strong> — authentication and infrastructure.</li>
        </ul>
      </section>

      <section>
        <h2>4. Your consent</h2>
        <p>
          When you first visit PayFlow, or when we introduce new non-essential cookies, we will ask for your consent
          before setting them. Essential cookies are set without consent because the Service cannot function without
          them, as permitted by the Privacy and Electronic Communications Regulations (PECR).
        </p>
        <p>You can withdraw or change your consent at any time by clearing your browser cookies for this site.</p>
      </section>

      <section>
        <h2>5. Managing cookies in your browser</h2>
        <p>
          You can control and delete cookies in your browser settings. Most browsers let you block all cookies, block
          third-party cookies, or delete cookies when you close the browser. Blocking essential cookies may stop parts
          of PayFlow from working, for example sign-in or saved shifts.
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noreferrer noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer noopener">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/en-gb/microsoft-edge" target="_blank" rel="noreferrer noopener">Microsoft Edge</a></li>
        </ul>
      </section>

      <section>
        <h2>6. Changes to this policy</h2>
        <p>
          We may update this Cookie Policy from time to time. The “Last updated” date at the top of the page shows the
          most recent revision.
        </p>
      </section>

      <section>
        <h2>7. Contact us</h2>
        <p>
          Questions about our use of cookies? Email{" "}
          <a href="mailto:info@londonra.com">info@londonra.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
