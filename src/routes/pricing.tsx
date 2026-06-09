import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { tierFor, estimateMonthlyGBP } from "@/lib/payflow/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PayFlow for business" },
      { name: "description", content: "Workers free forever. Business from £2.50 per active worker per month, £99/mo minimum. Volume discounts and a 90-day free pilot." },
      { property: "og:title", content: "PayFlow Pricing — Free for workers, fair for business" },
      { property: "og:description", content: "Workers free forever. Business from £2.50 per active worker per month, £99/mo minimum." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [workers, setWorkers] = useState(50);
  const tier = tierFor(workers);
  const monthly = estimateMonthlyGBP(workers);
  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-sand/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-ink-soft md:flex">
            <Link to="/" className="hover:text-ink">For workers</Link>
            <Link to="/pricing" className="text-ink">For business</Link>
          </nav>
          <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-sand hover:bg-primary">
            Get started <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
          Simple, fair pricing
        </div>
        <h1 className="mt-6 font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
          Free for workers.<br />Fair for business.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          Fewer payroll queries, lower churn, happier workers.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-12 md:grid-cols-2">
        {/* Workers */}
        <div className="rounded-3xl bg-card p-8 ring-1 ring-border">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">For workers</div>
          <div className="mt-3 font-display text-4xl font-extrabold">Free forever</div>
          <p className="mt-2 text-sm text-ink-soft">Track hours, estimate take-home, save from every shift. No card, no catch.</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {WORKER_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-primary" /><span>{f}</span></li>
            ))}
          </ul>
          <Link to="/signup" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-bold text-sand hover:bg-primary">
            Start free <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Business */}
        <div className="rounded-3xl bg-ink p-8 text-sand ring-1 ring-ink relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">For business & agencies</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-extrabold">£2.50</span>
              <span className="text-sm text-sand/70">per active worker / mo</span>
            </div>
            <p className="mt-2 text-sm text-sand/70">Billed only on workers who actually use the app. £99/mo minimum.</p>

            <div className="mt-5 rounded-2xl bg-sand/10 p-4 ring-1 ring-sand/15">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sand/60">Volume tiers</div>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between"><span>1–249 workers</span><span className="font-bold">£2.50</span></li>
                <li className="flex justify-between"><span>250–999 workers</span><span className="font-bold">£2.00</span></li>
                <li className="flex justify-between"><span>1,000+ workers</span><span className="font-bold">£1.50</span></li>
              </ul>
            </div>

            <ul className="mt-6 space-y-2.5 text-sm">
              {BIZ_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-primary" /><span>{f}</span></li>
              ))}
            </ul>

            <Link to="/signup" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground hover:scale-[1.01] transition-transform">
              Book a pilot <ArrowRight className="size-4" />
            </Link>
            <a href="mailto:hello@payflow.app" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sand/10 px-6 py-3 text-sm font-bold text-sand hover:bg-sand/15">
              Talk to us
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="90-day free pilot" body="One site, full features, no card." />
          <Stat label="~2 months free" body="On annual billing." />
          <Stat label="Active-worker billing" body="Pay for use, not seats sitting idle." />
        </div>

        <div className="mt-10 flex items-start gap-2 rounded-2xl bg-card p-4 ring-1 ring-border">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            PayFlow gives estimates only. It does not provide tax, legal, payroll, banking, investment or financial advice. Aggregate dashboards never expose any individual worker's pay or personal decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="font-display text-lg font-extrabold">{label}</div>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </div>
  );
}

const WORKER_FEATURES = [
  "Live shift tracker with auto-break",
  "Take-home estimator (PAYE, NI, pension)",
  "Save from every shift — your rules",
  "Payroll query helper (polite drafts)",
  "Plain English, UK-first",
];

const BIZ_FEATURES = [
  "Aggregate workforce dashboard",
  "Unlimited worker invites + join codes",
  "Worker engagement & hours tracked",
  "Estimated payroll queries avoided",
  "Email support, SSO on Enterprise",
];
