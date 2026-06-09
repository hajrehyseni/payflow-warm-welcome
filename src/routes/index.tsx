import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Wallet, PiggyBank, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import { HeroDemo } from "@/components/HeroDemo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayFlow — Know your pay before payday" },
      { name: "description", content: "Track your hours, estimate your take-home pay, and save from every shift. Built for UK hourly workers." },
      { property: "og:title", content: "PayFlow — Know your pay before payday" },
      { property: "og:description", content: "Track your hours, estimate your take-home pay, and save from every shift." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-[700px] rounded-full bg-primary-soft/70 blur-3xl opacity-60" />
        <div className="absolute top-[40%] -right-32 size-[600px] rounded-full bg-accent-soft/70 blur-3xl opacity-50" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-sand/70 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-soft md:flex">
            <Link to="/pricing" className="hover:text-ink">For business</Link>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-sand hover:bg-primary transition-colors"
          >
            Open PayFlow <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
              Built for UK hourly workers
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] text-balance">
              Know your pay <span className="text-primary">before</span> payday.
            </h1>
            <p className="mt-5 max-w-md mx-auto md:mx-0 text-lg leading-relaxed text-ink-soft">
              Track your hours, see your real take-home, and save from every shift. Free for workers.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-bold text-accent-foreground shadow-[0_12px_30px_-8px_rgba(255,107,94,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Open PayFlow — it's free <ArrowRight className="size-4" />
              </Link>
              <Link to="/pricing" className="text-sm font-bold text-ink-soft hover:text-ink underline-offset-4 hover:underline">
                For business →
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-soft">No sign-up needed to start.</p>
          </div>

          <div className="relative">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* How it works in 20 seconds */}
      <section id="how" className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">How it works in 20 seconds</div>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Five small steps. One big shift.
            </h2>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {STORY.map((step, i) => (
              <li key={step.title} className="rounded-3xl bg-sand p-5 ring-1 ring-border">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <step.icon className="size-5" />
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft">Step {i + 1}</div>
                <div className="mt-1 font-display text-base font-extrabold leading-snug">{step.title}</div>
                <p className="mt-1.5 text-sm leading-snug text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's inside */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">What's inside</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="size-4" /></div>
              <div className="mt-3 font-display text-xl font-extrabold">{f.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-start gap-2 rounded-2xl bg-card p-3.5 ring-1 ring-border max-w-2xl">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            PayFlow gives estimates only. It does not provide tax, legal, payroll, banking, investment or financial advice. Your actual payslip may differ.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Your hours, finally <span className="text-primary">clear</span>.
        </h2>
        <Link
          to="/app"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-[0_12px_30px_-8px_rgba(255,107,94,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Open PayFlow <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-ink-soft md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="font-display font-bold text-ink">PayFlow</span>
            <span>· built with UK hourly workers</span>
          </div>
          <div className="flex gap-5">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const STORY = [
  { icon: Clock, title: "Clock in", body: "One tap to start your shift. The timer runs in the background." },
  { icon: TrendingUp, title: "Watch your pay grow", body: "Earnings tick up live at your hourly rate. No more guessing." },
  { icon: Wallet, title: "Know your take-home", body: "An honest estimate after PAYE, NI and pension — in plain English." },
  { icon: PiggyBank, title: "Save from every shift", body: "Pick a rule. £1, £5 or 3% — your call. Watch your goal fill up." },
  { icon: Sparkles, title: "Build a better life", body: "Streaks and gentle nudges from Flow Coach. Always kind, never shame." },
];

const FEATURES = [
  { icon: Clock, title: "Live shift tracker", body: "Hit start when you clock in. Watch your earnings tick up at your hourly rate. Break pauses the clock." },
  { icon: Wallet, title: "Take-home estimator", body: "Gross pay, PAYE income tax, National Insurance and pension — explained in plain English." },
  { icon: PiggyBank, title: "Save from every shift", body: "Choose a rule and we'll show you weekly, monthly and yearly projections." },
  { icon: Sparkles, title: "Payroll query helper", body: "Drafts a polite message you can send to payroll if something on your payslip looks off." },
];
