import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PayFlow" },
      { name: "description", content: "How PayFlow by Londonra Ltd collects, uses and protects your personal data under UK GDPR." },
      { property: "og:title", content: "Privacy Policy — PayFlow" },
      { property: "og:description", content: "How PayFlow handles your data — UK GDPR compliant." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="2 July 2026"
      intro="This Privacy Policy explains how Londonra Ltd (“we”, “us”, “our”), the company behind PayFlow, collects, uses and protects your personal data when you use the PayFlow app and website (the “Service”). We are the data controller for the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018."
    >
      <section>
        <h2>1. Who we are</h2>
        <p>
          PayFlow is operated by <strong>Londonra Ltd</strong>, a company registered in England and Wales,
          with its registered office in London, United Kingdom. You can contact us at{" "}
          <a href="mailto:info@londonra.com">info@londonra.com</a>.
        </p>
      </section>

      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li><strong>Account data</strong> — email, name, password hash (when you sign in to sync across devices).</li>
          <li><strong>Work-tracking data</strong> — shifts, hours, hourly rate, payday, savings preferences that you enter.</li>
          <li><strong>Pay-check data</strong> — payslip figures you type in to compare against your tracked shifts. We do not read your payslip or connect to your bank or employer.</li>
          <li><strong>Technical data</strong> — device type, browser, IP address, and basic usage events to keep the Service running.</li>
          <li><strong>Communications</strong> — messages you send to <a href="mailto:info@londonra.com">info@londonra.com</a>.</li>
        </ul>
        <p>You can also use PayFlow as a guest, in which case your data is stored only on your device.</p>
      </section>

      <section>
        <h2>3. Lawful bases for processing</h2>
        <ul>
          <li><strong>Contract</strong> — to provide the Service you signed up for (account, sync, saved shifts).</li>
          <li><strong>Legitimate interests</strong> — to keep the Service secure, prevent abuse, and improve product quality.</li>
          <li><strong>Consent</strong> — for non-essential cookies, analytics, and any optional marketing communications. You can withdraw consent at any time.</li>
          <li><strong>Legal obligation</strong> — where we must retain records to comply with UK law.</li>
        </ul>
      </section>

      <section>
        <h2>4. How we use your data</h2>
        <ul>
          <li>Provide the pay-tracking, pay-check and savings features.</li>
          <li>Sync your data across your devices when you sign in.</li>
          <li>Keep the Service secure and diagnose faults.</li>
          <li>Respond to your support enquiries.</li>
          <li>Improve the Service based on aggregated, non-identifying usage patterns.</li>
        </ul>
        <p>We do not sell your personal data. We do not use your data to make automated decisions that produce legal or similarly significant effects.</p>
      </section>

      <section>
        <h2>5. Sharing with third parties</h2>
        <p>We only share data with processors who help us run the Service under written data-processing agreements:</p>
        <ul>
          <li><strong>Hosting and database</strong> — Supabase / Cloudflare (Lovable Cloud infrastructure).</li>
          <li><strong>Payments</strong> — Stripe, if you subscribe to a paid business plan. PayFlow never sees your card details.</li>
          <li><strong>Email</strong> — transactional email providers for account and support messages.</li>
        </ul>
        <p>We may disclose data if required by law, a court order, or to protect our rights or the safety of users.</p>
      </section>

      <section>
        <h2>6. International transfers</h2>
        <p>
          Some processors may store data outside the UK. Where they do, we rely on UK-approved safeguards such as the UK
          International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses.
        </p>
      </section>

      <section>
        <h2>7. How long we keep your data</h2>
        <ul>
          <li>Account and shift data: while your account is active, and up to 12 months after deletion for backup and dispute-resolution purposes.</li>
          <li>Support emails: up to 3 years.</li>
          <li>Anonymised analytics: may be retained indefinitely.</li>
        </ul>
      </section>

      <section>
        <h2>8. Your rights under UK GDPR</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong>Rectification</strong> — ask us to correct inaccurate or incomplete data.</li>
          <li><strong>Erasure</strong> — ask us to delete your data (the “right to be forgotten”).</li>
          <li><strong>Restriction</strong> — ask us to limit how we process your data.</li>
          <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
          <li><strong>Object</strong> — object to processing based on legitimate interests.</li>
          <li><strong>Withdraw consent</strong> — at any time, where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:info@londonra.com">info@londonra.com</a>. You also have the right to complain to the UK
          Information Commissioner's Office (ICO) at <a href="https://ico.org.uk">ico.org.uk</a>.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          We use industry-standard measures including encryption in transit (HTTPS), row-level database security, and
          restricted staff access. No system is 100% secure — please use a strong, unique password.
        </p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>
          We use a small number of essential and optional cookies. See our{" "}
          <a href="/cookie-policy">Cookie Policy</a> for details.
        </p>
      </section>

      <section>
        <h2>11. Children</h2>
        <p>PayFlow is not directed at children under 16 and we do not knowingly collect their data.</p>
      </section>

      <section>
        <h2>12. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be notified via the app or email. Continued
          use of the Service after changes means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>13. Contact us</h2>
        <p>
          Londonra Ltd, London, United Kingdom.<br />
          Email: <a href="mailto:info@londonra.com">info@londonra.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
