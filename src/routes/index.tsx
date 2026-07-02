import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Clock, Wallet, PiggyBank, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Users, MessageSquareOff, GraduationCap, HeartHandshake } from "lucide-react";
import { HeroDemo } from "@/components/HeroDemo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayFlow — Make sure you're paid right. Free." },
      { name: "description", content: "Pay protection, not pay advances. PayFlow tracks your hours, checks your payslip, and helps you save — free, forever. Built for UK hourly workers." },
      { property: "og:title", content: "PayFlow — Make sure you're paid right. Free." },
      { property: "og:description", content: "We don't lend you your money early and charge you. We make sure you get all of it — free." },
    ],
  }),
  component: Landing,
});

function CountUp({ end, suffix = "", duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * end);
      setCount(value);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return (
    <span aria-label={`${end.toLocaleString()}${suffix}`}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}


function Landing() {
  return (
    <div className="min-h-screen bg-sand text-ink overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-[700px] rounded-full bg-primary/30 blur-3xl opacity-80" />
        <div className="absolute top-[40%] -right-32 size-[600px] rounded-full bg-primary-soft blur-3xl opacity-90" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-sand/70 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-soft md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#business" className="hover:text-ink">For business</a>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              to="/login"
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink md:hidden"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Open PayFlow <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
              Pay protection — not pay advances
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] text-balance break-words">
              Make sure you're paid <span className="text-primary">right</span>.
            </h1>
            <p className="mt-5 max-w-md mx-auto md:mx-0 text-base sm:text-lg leading-relaxed text-ink-soft">
              We don't lend you your money early and charge you. We make sure you get <strong className="text-ink">all of it</strong> — free.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/app"
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-bold text-primary-foreground shadow-[0_12px_30px_-8px_rgba(0,87,255,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <span className="truncate">Open PayFlow — it's free</span> <ArrowRight className="size-4 shrink-0" />
              </Link>
              <a href="#business" className="text-sm font-bold text-ink-soft hover:text-ink underline-offset-4 hover:underline">
                For business →
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-soft">No sign-up needed to start · Free forever for workers</p>
          </div>

          <div className="relative">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-border/60 bg-card/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center">
            <div className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-primary">
              <CountUp end={12500} suffix="+" />
            </div>
            <p className="mt-2 text-lg sm:text-xl font-semibold text-ink">
              Trusted by 12,500+ workers across the UK
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl bg-sand p-6 ring-1 ring-border">
                <div className="text-3xl leading-none text-primary/30">"</div>
                <p className="mt-2 text-sm leading-relaxed text-ink">{t.quote}</p>
                <div className="mt-4 text-xs font-bold text-ink-soft">{t.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">
              Trusted by teams at
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex h-14 w-28 items-center justify-center rounded-xl bg-ink/5 text-xs font-semibold text-ink-soft"
                >
                  Partner Logo
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM / THE SOLUTION */}

      <section className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Problem */}
            <div className="rounded-3xl bg-sand p-7 ring-1 ring-border">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                <AlertTriangle className="size-3.5" /> The problem
              </div>
              <h2 className="mt-4 font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Payslips often hide mistakes.
              </h2>
              <p className="mt-3 text-ink-soft leading-relaxed">
                Missing hours. Wrong rates. Overtime left off. Most workers never check — and could be owed money right now.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
                <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" /> Hours rounded down at the till</li>
                <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" /> Overtime quietly skipped</li>
                <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" /> A confusing payslip no one explains</li>
              </ul>
            </div>

            {/* Solution */}
            <div className="rounded-3xl bg-primary p-7 text-primary-foreground ring-1 ring-primary/40">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="size-3.5" /> The solution
              </div>
              <h2 className="mt-4 font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                PayFlow checks your pay is right.
              </h2>
              <p className="mt-3 leading-relaxed opacity-90">
                Track your hours. See your real take-home in plain English. Catch what you're owed. Save a little from every shift. Free, forever.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm opacity-95">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Every hour counted, in your pocket</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> Pay Check compares payslip to reality</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> A polite draft message if it's off</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 5 steps */}
      <section id="how" className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">How it works</div>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Five small steps. Every penny earned.
          </h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {STORY.map((step, i) => (
            <li key={step.title} className="rounded-3xl bg-card p-5 ring-1 ring-border">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                <step.icon className="size-5" />
              </div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft">Step {i + 1}</div>
              <div className="mt-1 font-display text-base font-extrabold leading-snug">{step.title}</div>
              <p className="mt-1.5 text-sm leading-snug text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* PAY CHECK hero feature */}
      <section className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                <ShieldCheck className="size-3.5" /> Pay Check
              </div>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Catch what you're <span className="text-primary">owed</span>.
              </h2>
              <p className="mt-4 text-lg text-ink-soft leading-relaxed">
                On payday, enter what your payslip shows. PayFlow compares it to the hours you tracked and flags anything that looks off — gently, in plain English.
              </p>
              <ul className="mt-6 space-y-3">
                {PAYCHECK_BULLETS.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-ink">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/app"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_10px_26px_-12px_rgba(0,87,255,0.6)] hover:opacity-95 transition-opacity"
              >
                Try Pay Check <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-sand p-7 ring-1 ring-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Example</div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">Your payslip shows</span>
                <span className="font-display text-xl font-extrabold">£412.40</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">PayFlow expected</span>
                <span className="font-display text-xl font-extrabold text-primary">£438.10</span>
              </div>
              <div className="mt-4 rounded-2xl bg-accent-soft p-4 ring-1 ring-accent/20">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <AlertTriangle className="size-3.5" /> Heads up — £25.70 short
                </div>
                <p className="mt-1.5 text-[13px] text-ink leading-relaxed">
                  Looks like ~1.8 hours might be missing. Want a polite draft to send to payroll?
                </p>
              </div>
              <p className="mt-4 text-[11px] text-ink-soft leading-relaxed">
                Guidance only. Always check with your employer's payroll team — PayFlow estimates can differ from your actual pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATE — friendly money lessons */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <GraduationCap className="size-3.5" /> Friendly money lessons
          </div>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight leading-tight">
            Learn the bits no one teaches you.
          </h2>
          <p className="mt-3 text-ink-soft">No jargon. No scaremongering. Just plain English.</p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {LESSONS.map((l) => (
            <li key={l.title} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><l.icon className="size-4" /></div>
              <div className="mt-3 font-display text-lg font-extrabold">{l.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{l.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FOR BUSINESS */}
      <section id="business" className="border-y border-border/60 bg-ink text-sand">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <Building className="size-3.5" /> For business
            </div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Fewer pay queries. Teams that <span className="text-primary">stay</span>.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-sand/80">
              A clear signal you're paying people right — before HMRC ever asks. PayFlow gives your team confidence in their payslips and gives you an aggregate compliance early-warning view. No individual pay data, ever.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {BIZ.map((b) => (
              <li key={b.title} className="rounded-3xl bg-sand/5 p-6 ring-1 ring-sand/10">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary"><b.icon className="size-4" /></div>
                <div className="mt-3 font-display text-lg font-extrabold">{b.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-sand/70">{b.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:scale-[1.02] transition-transform"
            >
              See business pricing <ArrowRight className="size-4" />
            </Link>
            <Link to="/signup" className="text-sm font-bold text-sand/80 hover:text-sand underline-offset-4 hover:underline">
              Start a free pilot →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Every penny you've <span className="text-primary">earned</span>.
        </h2>
        <p className="mt-4 text-ink-soft">Free for workers. No advances. No fees. Just clarity.</p>
        <Link
          to="/app"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_12px_30px_-8px_rgba(0,87,255,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Open PayFlow <ArrowRight className="size-4" />
        </Link>
        <div className="mt-10 mx-auto flex items-start gap-2 rounded-2xl bg-card p-3.5 ring-1 ring-border max-w-xl text-left">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            PayFlow gives estimates and guidance only. It is not financial, tax, legal, payroll or banking advice. Always check Pay Check results with your employer's payroll team — your actual payslip may differ.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:px-6 text-xs text-ink-soft md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="font-display font-bold text-ink">PayFlow</span>
            <span>· by Londonra Ltd, London UK</span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms</Link>
            <Link to="/cookie-policy">Cookies</Link>
            <a href="mailto:info@londonra.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Small inline icon to avoid extra import lint noise
function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
    </svg>
  );
}

const STORY = [
  { icon: Clock, title: "Clock in", body: "One tap to start. The timer runs in the background." },
  { icon: TrendingUp, title: "See your pay grow", body: "Live earnings at your hourly rate. No more guessing." },
  { icon: ShieldCheck, title: "Check it's right", body: "Pay Check compares your payslip to what you tracked." },
  { icon: PiggyBank, title: "Save a little", body: "£1, £5 or 3% — your call. Watch your goal fill up." },
  { icon: Sparkles, title: "Build a better life", body: "Gentle nudges and streaks. Always kind, never shame." },
];

const PAYCHECK_BULLETS = [
  "Spots missing hours, wrong rates or skipped overtime",
  "Explains the gap in plain English — no jargon",
  "Drafts a polite message to send to payroll",
  "Free forever. We never charge you to see your own money.",
];

const LESSONS = [
  { icon: Wallet, title: "What is net pay?", body: "The bit that actually lands in your account — after PAYE, National Insurance and pension. We show every step." },
  { icon: TrendingUp, title: "Why your tax changes", body: "Tax codes, allowances and bonuses can all move your take-home. A short, kind explainer next to every estimate." },
  { icon: PiggyBank, title: "Build a safety pot", body: "A little from every shift adds up. Pick a rule that fits your budget and watch the months ahead get easier." },
];

const BIZ = [
  { icon: MessageSquareOff, title: "Fewer pay queries", body: "Workers can answer their own 'where did this go?' questions before they reach your inbox." },
  { icon: HeartHandshake, title: "Teams that stay", body: "Confidence in pay is the cheapest retention tool you have. Happier teams stay longer." },
  { icon: ShieldCheck, title: "Early-warning view", body: "An aggregate compliance signal — patterns in pay gaps, before HMRC ever asks. Never any individual pay data." },
];

const TESTIMONIALS = [
  { name: "Sarah M., Retail Worker", quote: "PayFlow spotted a tax code error that was costing me £40 a month. I had no idea until I checked." },
  { name: "James T., Warehouse Operative", quote: "I finally understand my payslip. The breakdown is so clear, even my wife uses it now." },
  { name: "Priya K., Care Worker", quote: "Saved over £200 last year just by catching shift payment mistakes. Worth every second." },
];
