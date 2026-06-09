import { useEffect, useState } from "react";
import { USER, RECENT, WEEK, TAKEHOME } from "./data";
import {
  Clock,
  TrendingUp,
  Coffee,
  PiggyBank,
  Sparkles,
  Heart,
  ArrowUpRight,
  CircleDot,
  ChevronRight,
  Quote,
  Wallet,
  Receipt,
  ShieldCheck,
  Flame,
  CheckCircle2,
  X,
  Pause,
  Play,
  Info,
} from "lucide-react";

const fmt = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────────────────────
// Live earnings hook — ticks up at hourly rate while "on shift" (pausable)
function useLiveEarnings(paused: boolean) {
  const baseSeconds = USER.worked.hours * 3600 + USER.worked.minutes * 60;
  const [seconds, setSeconds] = useState(baseSeconds);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);
  const earned = (seconds / 3600) * USER.hourly;
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  return { earned, hh, mm, seconds };
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY TAB
export function TodayScreen({ goToTab }: { goToTab?: (t: "today" | "pay" | "save" | "life" | "coach") => void }) {
  const [onBreak, setOnBreak] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savedBoost, setSavedBoost] = useState(0);

  const { earned, hh, mm } = useLiveEarnings(onBreak);
  const shiftPctRaw = ((hh * 60 + mm) / (6 * 60)) * 100;
  const shiftPct = Math.min(100, shiftPctRaw);

  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="flex h-full flex-col">
      <Header subtitle={onBreak ? "On break · paused" : "On shift · Maple Care Home"} name={USER.name} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Live earnings hero */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-[0_20px_40px_-20px_rgba(14,124,102,0.6)]">
          <div className="absolute -right-12 -top-12 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-8 size-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
              <span className={`size-1.5 rounded-full ${onBreak ? "bg-white/50" : "bg-accent animate-pulse-dot"}`} />
              {onBreak ? "Paused for break" : `Earning now · £${USER.hourly}/hr`}
            </div>
            <div className="mt-3 flex items-baseline gap-1 font-display tabular-nums tracking-tight">
              <span className="text-[56px] leading-none font-extrabold">
                £{Math.floor(earned)}
              </span>
              <span className="text-3xl font-bold opacity-85">
                .{(earned % 1).toFixed(2).slice(2)}
              </span>
            </div>
            <div className="mt-2 text-sm opacity-85">
              earned in {hh}h {String(mm).padStart(2, "0")}m on shift today
            </div>

            {/* Shift progress */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] font-medium opacity-85">
                <span>{USER.shiftStart}</span>
                <span>End {USER.shiftEnd}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-1000"
                  style={{ width: `${shiftPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-5 grid grid-cols-4 gap-2">
          <QuickAction
            icon={onBreak ? Play : Pause}
            label={onBreak ? "Resume" : "Log break"}
            active={onBreak}
            onClick={() => {
              setOnBreak((b) => !b);
              flash(onBreak ? "Welcome back — earnings resumed" : "Break started — clock paused");
            }}
          />
          <QuickAction
            icon={PiggyBank}
            label="Save £5"
            onClick={() => {
              setSavedBoost((s) => s + 5);
              flash(`£5 moved to Eid trip · +${fmt(savedBoost + 5)} today`);
            }}
          />
          <QuickAction
            icon={Receipt}
            label="Payslip"
            onClick={() => setPayslipOpen(true)}
          />
          <QuickAction
            icon={Sparkles}
            label="Coach"
            onClick={() => goToTab?.("coach")}
          />
        </section>

        {/* Coach nudge */}
        <section className="mt-5 rounded-3xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Flow Coach
              </div>
              <p className="mt-1 text-sm leading-snug text-ink">
                You're <span className="font-semibold">£12 ahead</span> of last Friday at this hour. Round-ups this week could add{" "}
                <span className="font-semibold">£8.40</span> to your Eid trip.
              </p>
              <button
                onClick={() => goToTab?.("coach")}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Enable smart round-ups <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Today list */}
        <section className="mt-6">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-base font-bold text-ink">Today so far</h3>
            <button
              onClick={() => flash("Showing this week's 4 shifts · 34 hrs total")}
              className="text-xs font-semibold text-primary active:scale-95 transition-transform"
            >
              All shifts
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {RECENT.slice(0, 4).map((t) => (
              <TxRow key={t.id} t={t} />
            ))}
          </ul>
        </section>

        {/* Disclaimer */}
        <div className="mt-5 rounded-2xl bg-card p-3.5 ring-1 ring-border">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              Flow Coach gives general information and estimates only — not financial, tax, legal, payroll or banking advice.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-6">
          <div className="pointer-events-auto rounded-2xl bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </div>
        </div>
      )}

      {/* Payslip translator overlay */}
      {payslipOpen && <PayslipTranslator onClose={() => setPayslipOpen(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYSLIP TRANSLATOR
const PAYSLIP_LINES: { code: string; label: string; value: number; positive?: boolean; plain: string }[] = [
  {
    code: "GROSS PAY",
    label: "Gross pay",
    value: TAKEHOME.gross,
    positive: true,
    plain:
      "What you earned in total before anything is taken off. 34 hours × £14.50/hr = £493.00. This is the headline number — your real take-home is below.",
  },
  {
    code: "PAYE TAX",
    label: "Income tax (PAYE)",
    value: -TAKEHOME.tax,
    plain:
      "Income tax taken a bit each payday so you don't get a big bill later. PAYE means 'Pay As You Earn'. You only pay tax on what you earn above £12,570 a year.",
  },
  {
    code: "NI CAT A",
    label: "National Insurance",
    value: -TAKEHOME.ni,
    plain:
      "This goes toward your State Pension, NHS and benefits if you ever need them. 'Cat A' just means the standard category for most workers.",
  },
  {
    code: "PENSION EE",
    label: "Pension (5%)",
    value: -TAKEHOME.pension,
    plain:
      "Still your money — just saved for later you. Your employer adds 3% on top. You can stop or change it any time through HR.",
  },
  {
    code: "NET PAY",
    label: "Take-home pay",
    value: TAKEHOME.net,
    positive: true,
    plain:
      "The number that actually lands in your account on Friday. This is the figure to budget with — everything above adds up to exactly £398.02.",
  },
];

function PayslipTranslator({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<string | null>("PAYE TAX");
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-sand">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Week ending Sun 7 Jun
          </div>
          <div className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Payslip translator
          </div>
        </div>
        <button
          onClick={onClose}
          className="grid size-10 place-items-center rounded-2xl bg-card ring-1 ring-border text-ink"
          aria-label="Close payslip"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="rounded-2xl bg-primary-soft px-3.5 py-2.5 text-[11px] font-semibold text-primary flex items-center gap-2">
          <Info className="size-3.5 shrink-0" /> Tap any line to see what it really means
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          {PAYSLIP_LINES.map((line, i) => {
            const isOpen = open === line.code;
            const isLast = i === PAYSLIP_LINES.length - 1;
            return (
              <div key={line.code} className={isLast ? "bg-primary-soft/40" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? null : line.code)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-sand-deep/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      {line.code}
                    </div>
                    <div className={`mt-0.5 text-sm font-semibold ${isLast ? "text-primary" : "text-ink"}`}>
                      {line.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`tabular-nums font-display ${
                        isLast
                          ? "text-xl font-extrabold text-primary"
                          : line.positive
                            ? "text-base font-bold text-ink"
                            : "text-base font-bold text-ink-soft"
                      }`}
                    >
                      {line.value < 0 ? "−" : ""}{fmt(Math.abs(line.value))}
                    </span>
                    <ChevronRight
                      className={`size-4 text-ink-soft transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="mx-3 mb-3 rounded-2xl bg-sand px-3.5 py-3 ring-1 ring-border">
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p className="text-[13px] leading-relaxed text-ink">{line.plain}</p>
                    </div>
                  </div>
                )}
                {!isLast && <div className="mx-4 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            The maths
          </div>
          <p className="mt-1.5 text-sm leading-snug text-ink">
            £493.00 − £50.25 − £20.08 − £24.65 = <span className="font-bold text-primary">£398.02</span> in your account on Friday.
          </p>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-border">
          <ShieldCheck className="size-3.5 text-primary" /> Flow Coach gives general information and estimates only — not financial, tax, legal, payroll or banking advice.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAY TAB
export function PayScreen() {
  const max = Math.max(...WEEK.map((d) => d.earned), 1);
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="This week · estimate" name="Pay" small />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Weekly hero */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Estimated take-home this week
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-display text-5xl font-extrabold tracking-tight text-ink tabular-nums">
              {fmt(TAKEHOME.net)}
            </div>
          </div>
          <div className="mt-1 text-xs text-ink-soft">
            from {fmt(TAKEHOME.gross)} gross · {USER.weeklyHours}h worked
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Estimate · not advice
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-5 rounded-2xl bg-card p-3.5 ring-1 ring-border">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              Flow Coach gives general information and estimates only — not financial, tax, legal, payroll or banking advice.
            </p>
          </div>
        </div>

        {/* Weekly bar chart */}
        <section className="mt-5 rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-base font-bold text-ink">Daily earnings</div>
              <div className="text-xs text-ink-soft">Mon — Sun</div>
            </div>
            <div className="text-xs font-semibold text-primary">+£12 vs last week</div>
          </div>
          <div className="mt-5 flex h-40 items-stretch justify-between gap-2">
            {WEEK.map((d) => {
              const isMax = d.earned === max && d.earned > 0;
              const h = d.earned > 0 ? Math.max((d.earned / max) * 100, 8) : 4;
              return (
                <div key={d.day} className="flex h-full flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    {isMax && (
                      <span className="absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                        {fmt(d.earned)}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        d.live
                          ? "bg-accent"
                          : isMax
                            ? "bg-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-card"
                            : d.earned === 0
                              ? "bg-sand-deep"
                              : "bg-primary/70"
                      }`}
                      style={{ height: `${h}%`, opacity: d.earned === 0 ? 0.6 : 1 }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${d.live ? "text-accent" : isMax ? "text-primary" : "text-ink-soft"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

        </section>

        {/* Take-home breakdown */}
        <section className="mt-5 rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="font-display text-base font-bold text-ink">Where it goes (est.)</div>
          <ul className="mt-4 space-y-3">
            <BreakdownRow label="Gross pay" value={TAKEHOME.gross} bold />
            <BreakdownRow label="Income tax" value={-TAKEHOME.tax} />
            <BreakdownRow label="National Insurance" value={-TAKEHOME.ni} />
            <BreakdownRow label="Pension (5%)" value={-TAKEHOME.pension} />
            <div className="my-2 h-px bg-border" />
            <BreakdownRow label="Take home" value={TAKEHOME.net} highlight />
          </ul>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE TAB
export function SaveScreen() {
  const pct = (USER.savingsBalance / USER.savingsGoal) * 100;
  const C = 2 * Math.PI * 70;
  const offset = C - (pct / 100) * C;
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Gentle, automatic" name="Save" small />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Goal ring */}
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Goal · {USER.savingsGoalName}
            </div>
            <div className="relative mx-auto mt-4 size-44">
              <svg viewBox="0 0 160 160" className="size-full -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="var(--sand-deep)" strokeWidth="12" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="var(--primary)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-3xl font-extrabold tabular-nums text-ink">
                    {fmt(USER.savingsBalance)}
                  </div>
                  <div className="text-xs text-ink-soft">of {fmt(USER.savingsGoal)}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-ink-soft">
              On track to finish <span className="font-semibold text-ink">12 Jul</span>
            </div>
          </div>
        </section>

        {/* Auto-save toggles */}
        <section className="mt-5 space-y-2">
          <SaveRule icon={CircleDot} title="Round up every payment" sub="Avg £1.20/day · pauses on tight weeks" on />
          <SaveRule icon={TrendingUp} title="Save 5% of every shift" sub="Skims after tax estimate" on />
          <SaveRule icon={Coffee} title="Skip the coffee swap" sub="Move £3.50 when you skip" />
        </section>

        {/* History */}
        <section className="mt-6">
          <h3 className="font-display text-base font-bold text-ink">Recent savings</h3>
          <ul className="mt-3 space-y-2">
            {RECENT.filter((t) => t.type === "save").concat([
              { id: "s2", label: "Shift skim · 5%", meta: "Yesterday", amount: 5.8, type: "save", date: "Yesterday" },
              { id: "s3", label: "Round-ups (week)", meta: "Last week", amount: 8.4, type: "save", date: "Last wk" },
            ]).map((t) => (
              <TxRow key={t.id} t={t} positiveOnly />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFE TAB
export function LifeScreen() {
  const [toast, setToast] = useState<string | null>(null);
  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2400);
  }
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Small wins that add up" name="Life" small />
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
        {/* Money-confidence score */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Money-confidence score
              </div>
              <div className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink">
                72<span className="text-2xl text-ink-soft">/100</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-primary">
                ↑ 24 points since January
              </div>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft">
              <TrendingUp className="size-7 text-primary" />
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sand-deep">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: "72%" }} />
          </div>
        </section>

        {/* Savings streak */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-accent-soft">
              <Flame className="size-5 text-accent" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-ink">6 weeks of saving from every shift</div>
              <div className="text-xs text-ink-soft">Amina, you're building a habit that sticks</div>
            </div>
          </div>
        </section>

        {/* Small wins */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="font-display text-base font-bold text-ink">Small wins</div>
          <ul className="mt-3 space-y-3">
            {[
              "Hit your weekly target 3 weeks running",
              "Saved your first £100",
              "Spotted a missing shift and got it paid",
              "Understood your whole payslip",
            ].map((win) => (
              <li key={win} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-sm leading-snug text-ink">{win}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Reassuring line */}
        <div className="rounded-2xl bg-primary-soft px-5 py-4 text-center">
          <div className="font-display text-sm font-bold text-primary">
            You are not behind. You are building.
          </div>
        </div>

        {/* Perks section */}
        <section className="pt-2">
          <div className="mb-3 font-display text-base font-bold text-ink">Perks for you</div>
          <div className="space-y-3">
            <LifeCard
              tag="Free this month"
              title="NHS workers — 20% off rail travel"
              body="Use your work ID for off-peak journeys until 30 Jun."
              accent
            />
            <LifeCard
              tag="Wellbeing"
              title="2 free counselling sessions"
              body="Confidential support through your care provider's wellbeing fund."
            />
            <LifeCard
              tag="Skill up"
              title="Level 3 Care Cert · funded"
              body="Boost your hourly rate by ~£1.20. 12 weeks, evenings only."
            />
            <LifeCard
              tag="Save on bills"
              title="Council Tax — check your band"
              body="1 in 5 carers are on the wrong band. 4-min check."
            />
            <LifeCard
              tag="Community"
              title="Carers' Sunday brunch · Hackney"
              body="Free brunch this Sunday. 14 carers going."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COACH TAB
const COACH_QA = [
  {
    q: "What will I take home?",
    a: `This week, with 34 hours at £14.50, your gross is £493.00. After PAYE tax (£50.25), National Insurance (£20.08) and pension (£24.65), your estimated take-home is £398.02. That's yours to spend, save, or send home.`,
  },
  {
    q: "Why is my pay lower than gross?",
    a: `Your payslip takes a bit out for three good reasons: PAYE tax (so you don't get a big bill later), National Insurance (for the NHS and your state pension), and workplace pension (still your money, just saved for later). It looks smaller, but it's protecting future you.`,
  },
  {
    q: "Can I save £5 this shift?",
    a: `Absolutely. If you save £5 from today's shift, that's £20 this month. At that pace, you'd have enough for your Eid trip 3 weeks sooner. Want me to set it aside automatically?`,
  },
  {
    q: "What should I do before payday?",
    a: `Three small things: check your rota is confirmed so no hours go missing, set aside £5–10 into your savings pot if you can, and plan one no-spend day. These tiny habits are what turn "just getting by" into "moving forward".`,
  },
];

export function CoachScreen() {
  const [asked, setAsked] = useState<string[]>([]);

  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Your weekly check-in" name="Flow Coach" small />
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
        {/* Greeting bubble */}
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div className="rounded-3xl rounded-tl-md bg-card p-4 ring-1 ring-border">
            <p className="text-sm leading-relaxed text-ink">
              Hi Amina 👋 You worked <span className="font-semibold">34 hours</span> this week — strong week. Your take-home is on track for{" "}
              <span className="font-semibold">{fmt(TAKEHOME.net)}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft">
            <Heart className="size-5 text-accent" />
          </div>
          <div className="rounded-3xl rounded-tl-md bg-card p-4 ring-1 ring-border">
            <p className="text-sm leading-relaxed text-ink">
              Quick win: skipping one takeaway this week could move <span className="font-semibold">£12</span> toward your Eid trip — that's 2% closer.
            </p>
            <div className="mt-3 flex gap-2">
              <ChipBtn primary>Add £12 to goal</ChipBtn>
              <ChipBtn>Not this week</ChipBtn>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft">
            <Wallet className="size-5 text-primary" />
          </div>
          <div className="rounded-3xl rounded-tl-md bg-card p-4 ring-1 ring-border">
            <p className="text-sm leading-relaxed text-ink">
              Your Saturday shift is unconfirmed. Want me to remind you to chase the rota by 5pm Friday?
            </p>
            <div className="mt-3 flex gap-2">
              <ChipBtn primary>Yes, remind me</ChipBtn>
              <ChipBtn>Not needed</ChipBtn>
            </div>
          </div>
        </div>

        {/* Asked Q&A bubbles */}
        {asked.map((q) => {
          const item = COACH_QA.find((c) => c.q === q)!;
          return (
            <div key={q} className="space-y-3">
              {/* User question */}
              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-3xl rounded-tr-md bg-primary p-4 text-primary-foreground">
                  <p className="text-sm leading-relaxed">{item.q}</p>
                </div>
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sand-deep font-display text-sm font-bold text-ink">
                  A
                </div>
              </div>
              {/* Coach answer */}
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </div>
                <div className="rounded-3xl rounded-tl-md bg-card p-4 ring-1 ring-border">
                  <p className="text-sm leading-relaxed text-ink">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Suggested questions */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft px-1">
            Try asking
          </div>
          <div className="flex flex-wrap gap-2">
            {COACH_QA.map((item) => {
              const isAsked = asked.includes(item.q);
              return (
                <button
                  key={item.q}
                  onClick={() => {
                    if (!isAsked) setAsked((prev) => [...prev, item.q]);
                  }}
                  disabled={isAsked}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 transition-all text-left ${
                    isAsked
                      ? "bg-sand-deep text-ink-soft ring-border opacity-60"
                      : "bg-card text-ink ring-border hover:bg-primary-soft hover:ring-primary/30 active:scale-95"
                  }`}
                >
                  {item.q}
                </button>
              );
            })}
          </div>
        </div>

        {/* User reply prompt */}
        <div className="sticky bottom-2 rounded-full bg-card px-4 py-3 ring-1 ring-border flex items-center gap-2 shadow-sm">
          <span className="text-sm text-ink-soft flex-1">Ask Flow Coach anything…</span>
          <button className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <ArrowUpRight className="size-4" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl bg-card p-3.5 ring-1 ring-border">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              Flow Coach gives general information and estimates only — not financial, tax, legal, payroll or banking advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
function Header({ name, subtitle, small }: { name: string; subtitle: string; small?: boolean }) {
  return (
    <div className="px-5 pt-12 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {subtitle}
          </div>
          <div className={`font-display font-extrabold tracking-tight text-ink ${small ? "text-2xl" : "text-3xl"}`}>
            {small ? name : `Hi, ${name}`}
          </div>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl bg-primary-soft font-display text-base font-bold text-primary ring-1 ring-primary/10">
          A
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, active }: { icon: typeof Clock; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 ring-1 active:scale-95 transition-transform ${active ? "bg-accent-soft ring-accent/40" : "bg-card ring-border"}`}
    >
      <div className={`grid size-9 place-items-center rounded-xl ${active ? "bg-accent text-white" : "bg-sand-deep text-primary"}`}>
        <Icon className="size-4" />
      </div>
      <span className="text-[10px] font-semibold text-ink">{label}</span>
    </button>
  );
}

function TxRow({ t, positiveOnly }: { t: { id: string; label: string; meta: string; amount: number; type: string }; positiveOnly?: boolean }) {
  const isSave = t.type === "save";
  const isTip = t.type === "tip";
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${isSave ? "bg-primary-soft" : isTip ? "bg-accent-soft" : "bg-sand-deep"}`}>
        {isSave ? <PiggyBank className="size-4 text-primary" /> : isTip ? <Heart className="size-4 text-accent" /> : <Clock className="size-4 text-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{t.label}</div>
        <div className="truncate text-[11px] text-ink-soft">{t.meta}</div>
      </div>
      <div className={`text-sm font-bold tabular-nums ${positiveOnly || isSave ? "text-primary" : isTip ? "text-accent" : "text-ink"}`}>
        +{fmt(t.amount)}
      </div>
    </li>
  );
}

function BreakdownRow({ label, value, bold, highlight }: { label: string; value: number; bold?: boolean; highlight?: boolean }) {
  return (
    <li className="flex items-baseline justify-between">
      <span className={`text-sm ${bold || highlight ? "font-bold text-ink" : "text-ink-soft"}`}>{label}</span>
      <span className={`tabular-nums ${highlight ? "font-display text-xl font-extrabold text-primary" : bold ? "text-sm font-bold text-ink" : "text-sm font-semibold text-ink"}`}>
        {value < 0 ? "−" : ""}{fmt(Math.abs(value))}
      </span>
    </li>
  );
}

function SaveRule({ icon: Icon, title, sub, on }: { icon: typeof Clock; title: string; sub: string; on?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border">
      <div className="grid size-10 place-items-center rounded-xl bg-sand-deep">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="text-[11px] text-ink-soft">{sub}</div>
      </div>
      <div className={`relative h-6 w-10 rounded-full transition-colors ${on ? "bg-primary" : "bg-sand-deep"}`}>
        <div className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </div>
  );
}

function LifeCard({ tag, title, body, accent }: { tag: string; title: string; body: string; accent?: boolean }) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${accent ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"}`}>
        {tag}
      </span>
      <div className="mt-2.5 font-display text-base font-bold leading-snug text-ink">{title}</div>
      <p className="mt-1 text-sm leading-snug text-ink-soft">{body}</p>
      <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        Learn more <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

function ChipBtn({ primary, children }: { primary?: boolean; children: React.ReactNode }) {
  return (
    <button className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors ${primary ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-ink ring-border"}`}>
      {children}
    </button>
  );
}

// Re-export Quote for landing page use (lucide doesn't always include it consistently)
export { Quote };
