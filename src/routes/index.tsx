import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, PiggyBank, Sparkles, Heart, ShieldCheck, Quote, Wallet, Star } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TodayScreen } from "@/components/app/screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayFlow — See your shift earn, in real time" },
      { name: "description", content: "Worker-first app for hourly pay. Watch shift earnings tick up live, see your take-home, save gently, and live better." },
      { property: "og:title", content: "PayFlow — See your shift earn, in real time" },
      { property: "og:description", content: "Built for hourly workers. Live pay, clear take-home, gentle savings. No banking, no lending — just clarity." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* Soft ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-[700px] rounded-full bg-primary-soft/70 blur-3xl opacity-60" />
        <div className="absolute top-[40%] -right-32 size-[600px] rounded-full bg-accent-soft/70 blur-3xl opacity-50" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-sand/70 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-soft">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#coach" className="hover:text-ink">Flow Coach</a>
            <a href="#trust" className="hover:text-ink">Why us</a>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-sand hover:bg-primary transition-colors"
          >
            Open demo <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
              <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
              Built for hourly workers · not banks
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] text-balance">
              See your shift <span className="text-primary">earn</span>, in real time.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft text-pretty">
              PayFlow turns every hour you work into something you can <em>feel</em>. Watch your pay tick up live, understand exactly what hits your bank, and save gently — without thinking about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground shadow-[0_12px_30px_-8px_rgba(255,107,94,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Try the demo <ArrowRight className="size-4" />
              </Link>
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <div className="flex -space-x-1.5">
                  {["bg-primary/80", "bg-accent/80", "bg-ink/70"].map((c, i) => (
                    <div key={i} className={`size-7 rounded-full ${c} ring-2 ring-sand`} />
                  ))}
                </div>
                <span className="font-medium">Loved by carers, drivers,<br/>retail & hospitality crews.</span>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary"/> No banking</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary"/> No lending</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary"/> Estimates, always honest</span>
            </div>
          </div>

          {/* Hero phone */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <PhoneFrame className="md:scale-95">
              <TodayScreen />
              {/* fake bar to suggest tab bar exists (non-interactive in hero) */}
              <div className="pointer-events-none absolute inset-x-3 bottom-3 h-14 rounded-full bg-card/95 ring-1 ring-border backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]" />
            </PhoneFrame>

            {/* Floating proof card */}
            <div className="absolute -left-6 top-16 hidden sm:block animate-fade-up [animation-delay:400ms]">
              <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border shadow-xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Live</div>
                <div className="mt-0.5 text-sm font-bold">+£14.50/hr</div>
                <div className="text-[11px] text-ink-soft">earning right now</div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-24 hidden sm:block animate-fade-up [animation-delay:550ms]">
              <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border shadow-xl">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                  <PiggyBank className="size-3.5" /> Saved
                </div>
                <div className="mt-0.5 text-sm font-bold">£2.40</div>
                <div className="text-[11px] text-ink-soft">round-up · today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The magic loop */}
      <section id="how" className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The magic loop</div>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              From clocking in to living better — in one quiet rhythm.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-5">
            {LOOP.map((step, i) => (
              <div key={step.title} className="rounded-3xl bg-sand p-5 ring-1 ring-border">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <step.icon className="size-5" />
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft">Step {i + 1}</div>
                <div className="mt-1 font-display text-lg font-extrabold leading-snug">{step.title}</div>
                <p className="mt-1.5 text-sm leading-snug text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature triplet */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureBig
            tag="Today"
            title="Watch your pay grow."
            body="Live earnings tick up at your rate, second by second. The hours you work finally feel real."
            tone="primary"
          />
          <FeatureBig
            tag="Pay"
            title="Know what actually lands."
            body="Tax, NI, pension — a clean estimate of your take-home, updated every shift. No surprises on payday."
            tone="ink"
          />
          <FeatureBig
            tag="Save"
            title="A gentle, automatic nudge."
            body="Round-ups, shift skims, skip-the-coffee swaps. Small moves that don't squeeze your week."
            tone="accent"
          />
        </div>
      </section>

      {/* Flow Coach feature */}
      <section id="coach" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-primary text-primary-foreground">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-center p-10 md:p-14">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5" /> Flow Coach
              </div>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                A quiet companion that knows your week.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed opacity-90">
                Flow Coach checks in once a day with a single, useful nudge. Never pushy. Never selling you a loan. Just a tiny voice in your corner that notices you worked late on Tuesday and asks if you want to skim £8 toward your goal.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Honest", "Calm", "Worker-first", "Estimates only"].map((p) => (
                  <span key={p} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{p}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <CoachBubble>
                Hi Amina — your 34 hours this week put your take-home on track for <b>£398.02</b>. Strongest week in a month 👏
              </CoachBubble>
              <CoachBubble dim>
                Skipping one takeaway could move <b>£12</b> toward your Eid trip. Want me to set that aside?
              </CoachBubble>
              <CoachBubble dim>
                Your Saturday rota isn't confirmed. Remind you to chase it Friday at 5pm?
              </CoachBubble>
            </div>
          </div>
        </div>
      </section>

      {/* Voices */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure key={q.name} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <Quote className="size-5 text-primary" />
              <blockquote className="mt-3 text-sm leading-relaxed text-ink">"{q.quote}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-primary-soft font-bold text-primary">{q.name[0]}</div>
                <div>
                  <div className="text-sm font-bold">{q.name}</div>
                  <div className="text-[11px] text-ink-soft">{q.role}</div>
                </div>
              </figcaption>
              <div className="mt-3 flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current"/>)}
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] items-start">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">What we won't do</div>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight leading-tight">
                We don't hold your money. We don't lend it. Ever.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft max-w-md">
                PayFlow is a clarity tool. Your bank stays your bank, your wage stays your wage. We just help you see, feel and steward it — clearly.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {TRUST.map((t) => (
                <li key={t.title} className="rounded-2xl bg-sand p-4 ring-1 ring-border">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary-soft">
                    <ShieldCheck className="size-4 text-primary" />
                  </div>
                  <div className="mt-3 text-sm font-bold">{t.title}</div>
                  <div className="mt-1 text-xs leading-snug text-ink-soft">{t.body}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.02] text-balance">
          Your hours, finally <span className="text-primary">visible</span>.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          Step into Amina's week. See how PayFlow feels in the hand.
        </p>
        <Link
          to="/app"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-accent-foreground shadow-[0_12px_30px_-8px_rgba(255,107,94,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Try the live demo <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-ink-soft md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="font-display font-bold text-ink">PayFlow</span>
            <span>· built with hourly workers</span>
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

const LOOP = [
  { icon: Clock, title: "Clock in", body: "Your shift starts the moment you do — your live rate begins ticking." },
  { icon: Wallet, title: "See pay grow", body: "Watch your earnings rise pound by pound, second by second." },
  { icon: ShieldCheck, title: "Know take-home", body: "An honest estimate after tax, NI and pension. No surprises." },
  { icon: PiggyBank, title: "Save gently", body: "Round-ups and small skims toward a goal that matters to you." },
  { icon: Heart, title: "Live better", body: "Real perks, free training, calm wellbeing — earned, not sold." },
];

const QUOTES = [
  { name: "Amina", role: "Care worker · London", quote: "I finally understand what £14.50/hr actually means in my bank. It's the first money app that respects my time." },
  { name: "Joel", role: "Rideshare · Manchester", quote: "Round-ups put £42 away last month without me noticing. That's a tank of fuel I didn't have to find." },
  { name: "Priya", role: "Hospitality · Leeds", quote: "Flow Coach feels like a friend, not a finance app. It nudges me kindly, never guilt-trips." },
];

const TRUST = [
  { title: "Read-only by design", body: "We never move money. We can't. Your wages land in your bank, untouched." },
  { title: "Estimates clearly marked", body: "Every figure says it's an estimate. We'd rather be honest than precise-wrong." },
  { title: "No loans, no advances", body: "We don't sell debt dressed as help. Earned-wage access isn't our model." },
  { title: "Your data, your rules", body: "Delete everything in two taps. We never sell anything to anyone." },
];

function FeatureBig({ tag, title, body, tone }: { tag: string; title: string; body: string; tone: "primary" | "ink" | "accent" }) {
  const toneCls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-ink text-sand";
  return (
    <div className={`rounded-[2rem] p-7 ${toneCls} flex flex-col min-h-[260px]`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">{tag}</div>
      <div className="mt-3 font-display text-2xl font-extrabold leading-tight">{title}</div>
      <p className="mt-3 text-sm leading-relaxed opacity-90">{body}</p>
      <div className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-bold">
        See it in the demo <ArrowRight className="size-4" />
      </div>
    </div>
  );
}

function CoachBubble({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={`rounded-3xl rounded-tl-md p-4 text-sm leading-relaxed ring-1 ${dim ? "bg-white/10 ring-white/15" : "bg-white/20 ring-white/25"}`}>
      {children}
    </div>
  );
}
