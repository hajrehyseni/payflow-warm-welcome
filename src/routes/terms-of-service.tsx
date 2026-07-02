import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — PayFlow" },
      { name: "description", content: "The terms that govern your use of PayFlow, a UK pay transparency tool by Londonra Ltd." },
      { property: "og:title", content: "Terms of Service — PayFlow" },
      { property: "og:description", content: "The terms that govern your use of PayFlow." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="2 July 2026"
      intro="These Terms of Service (“Terms”) govern your use of PayFlow, provided by Londonra Ltd (“we”, “us”, “our”), a company registered in England and Wales. By using PayFlow you agree to these Terms. If you do not agree, please do not use the Service."
    >
      <section>
        <h2>1. The Service</h2>
        <p>
          PayFlow is a <strong>pay transparency tool</strong> for UK hourly workers. It lets you track your shifts,
          estimate your take-home pay, compare figures from your payslip, and set aside a small percentage from each
          shift as savings. PayFlow is <strong>not</strong> a bank, lender, payroll provider, tax adviser, or financial
          adviser. Estimates are provided for guidance only and may differ from your actual payslip.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 16 years old and resident in the United Kingdom to use PayFlow. By using the Service you
          confirm that the information you provide is accurate.
        </p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <ul>
          <li>You are responsible for keeping your login credentials secure.</li>
          <li>You must not share your account or let others use it.</li>
          <li>Notify us immediately at <a href="mailto:info@londonra.com">info@londonra.com</a> if you suspect unauthorised access.</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use PayFlow for anything unlawful, misleading, or harmful.</li>
          <li>Attempt to reverse engineer, scrape, or interfere with the Service.</li>
          <li>Upload false or fraudulent payroll information.</li>
          <li>Use PayFlow to harass any employer, colleague, or third party.</li>
        </ul>
      </section>

      <section>
        <h2>5. Pay Check and estimates disclaimer</h2>
        <p>
          Pay Check compares figures <em>you enter</em> against the shifts you have tracked. It is a guidance tool only.
          Estimated take-home pay, tax, National Insurance, and pension deductions are approximations and may not match
          your actual payslip. Always confirm any pay concern with your employer's payroll team. PayFlow is not liable
          for pay decisions made based on estimates.
        </p>
      </section>

      <section>
        <h2>6. Paid plans (business)</h2>
        <p>
          Business plans are billed via Stripe under the pricing shown at checkout. Subscriptions renew automatically
          unless cancelled. You may cancel at any time; cancellation takes effect at the end of the current billing
          period. UK consumer rights, where applicable, are not affected.
        </p>
      </section>

      <section>
        <h2>7. Intellectual property</h2>
        <p>
          All content, branding, design, software and trademarks in the Service are owned by Londonra Ltd or licensed
          to us. You may use PayFlow only as permitted by these Terms. You retain ownership of the data you enter and
          grant us a limited licence to process it in order to provide the Service.
        </p>
      </section>

      <section>
        <h2>8. Privacy</h2>
        <p>
          Your use of PayFlow is subject to our <a href="/privacy-policy">Privacy Policy</a> and{" "}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
      </section>

      <section>
        <h2>9. Availability and changes</h2>
        <p>
          We aim to keep PayFlow available at all times but do not guarantee uninterrupted access. We may modify,
          suspend or discontinue features at any time. We will give reasonable notice of material changes where
          practical.
        </p>
      </section>

      <section>
        <h2>10. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Londonra Ltd is not liable for indirect, incidental, special, or
          consequential losses, including loss of income, savings, or data. Our total liability arising out of or in
          connection with the Service in any 12-month period is limited to the greater of (a) the amount you paid us in
          that period, or (b) £100.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability that cannot lawfully be excluded, including for death or
          personal injury caused by negligence, fraud, or your statutory rights as a UK consumer.
        </p>
      </section>

      <section>
        <h2>11. Termination</h2>
        <p>
          You may stop using PayFlow and delete your account at any time. We may suspend or terminate accounts that
          breach these Terms or are used unlawfully.
        </p>
      </section>

      <section>
        <h2>12. Governing law and jurisdiction</h2>
        <p>
          These Terms are governed by the laws of <strong>England and Wales</strong>. Any disputes will be subject to
          the exclusive jurisdiction of the courts of England and Wales, save that UK consumers may bring proceedings
          in the courts of their place of residence.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Londonra Ltd, London, United Kingdom.<br />
          Email: <a href="mailto:info@londonra.com">info@londonra.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
