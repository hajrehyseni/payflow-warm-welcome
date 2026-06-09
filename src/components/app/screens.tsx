import { useEffect, useRef, useState } from "react";
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
  Building2,
  Users,
  Copy,
  Send,
  Target,
  Rocket,
} from "lucide-react";

const fmt = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────────────────────
// Streak store — shared across all screens. Positive actions call celebrate().
let _streak = 6;
let _celebration: string | null = null;
let _confettiToken = 0;
let _celebTimer: number | undefined;
const _listeners = new Set<() => void>();
function _notify() { _listeners.forEach((l) => l()); }

function celebrate(actionMsg?: string) {
  _streak += 1;
  const firstName = USER.name.split(" ")[0];
  _celebration = actionMsg
    ? `${actionMsg} · streak now ${_streak} weeks 🎉`
    : `Nice one, ${firstName} — streak now ${_streak} weeks 🎉`;
  _confettiToken += 1;
  _notify();
  if (typeof window !== "undefined") {
    window.clearTimeout(_celebTimer);
    _celebTimer = window.setTimeout(() => { _celebration = null; _notify(); }, 3200);
  }
}

function useStreak() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);
  return { streak: _streak, celebration: _celebration, confettiToken: _confettiToken };
}

// Smooth count-up for big numbers.
function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(fromRef.current + (value - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

// Confetti burst — fires on every celebrate().
function Confetti() {
  const { confettiToken } = useStreak();
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; rot: number; color: string; dur: number }[]>([]);
  useEffect(() => {
    if (!confettiToken) return;
    const palette = ["#0E7C66", "#E07A5F", "#F2CC8F", "#81B29A", "#F4D35E"];
    const next = Array.from({ length: 28 }, (_, i) => ({
      id: confettiToken * 100 + i,
      left: Math.random() * 100,
      delay: Math.random() * 120,
      rot: Math.random() * 360,
      color: palette[i % palette.length],
      dur: 900 + Math.random() * 700,
    }));
    setPieces(next);
    const t = window.setTimeout(() => setPieces([]), 2200);
    return () => window.clearTimeout(t);
  }, [confettiToken]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute -top-3 block size-2 rounded-[2px]"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall ${p.dur}ms cubic-bezier(0.2,0.7,0.3,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}

function CelebrationToast() {
  const { celebration } = useStreak();
  return (
    <>
      <Confetti />
      {celebration && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-6">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-primary/30 animate-in fade-in slide-in-from-bottom-2">
            <Flame className="size-4 shrink-0" />
            <span>{celebration}</span>
          </div>
        </div>
      )}
    </>
  );
}

// Persistent guidance line — warm, never scary.
function GuidanceLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-primary-soft/60 px-3 py-1.5 text-[10.5px] font-semibold text-primary/90 ring-1 ring-primary/10 ${className}`}>
      <ShieldCheck className="size-3.5 shrink-0" />
      <span>Guidance only — not financial advice. Your money decisions are your own.</span>
    </div>
  );
}

// One-time welcome card.
export function WelcomeCard({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center bg-ink/40 backdrop-blur-sm animate-in fade-in">
      <div className="m-3 w-full max-w-sm rounded-3xl bg-card p-6 ring-1 ring-border shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft">
          <Heart className="size-6 text-primary" />
        </div>
        <div className="mt-3 font-display text-xl font-extrabold leading-tight text-ink">
          Welcome to PayFlow
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          PayFlow is your money <span className="font-semibold">guide</span>, not a financial adviser.
          We help you understand your pay and build better habits —
          <span className="font-semibold"> all money decisions and responsibilities stay yours.</span>
        </p>
        <button
          onClick={onAccept}
          className="mt-5 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow active:scale-[0.98] transition-all"
        >
          Got it
        </button>
        <p className="mt-3 text-center text-[10.5px] text-ink-soft">
          We're not a regulated or licensed financial service.
        </p>
      </div>
    </div>
  );
}

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
export function TodayScreen({ goToTab, onProfileClick }: { goToTab?: (t: "today" | "pay" | "save" | "life" | "coach") => void; onProfileClick?: () => void }) {
  const [onBreak, setOnBreak] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savedBoost, setSavedBoost] = useState(0);

  const { earned, hh, mm } = useLiveEarnings(onBreak);
  const earnedAnim = useCountUp(earned, 600);
  const shiftPctRaw = ((hh * 60 + mm) / (6 * 60)) * 100;
  const shiftPct = Math.min(100, shiftPctRaw);

  // Goal ring values (savings + boost from quick-saves this session)
  const balance = USER.savingsBalance + savedBoost;
  const goalPct = Math.min(100, (balance / USER.savingsGoal) * 100);
  const goalPctAnim = useCountUp(goalPct, 700);
  const RC = 2 * Math.PI * 26;
  const ringOffset = RC - (goalPctAnim / 100) * RC;

  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2400);
  }


  return (
    <div className="flex h-full flex-col">
      <Header subtitle={onBreak ? "On break · paused" : "On shift · Maple Care Home"} name={USER.name} onProfileClick={onProfileClick} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Your next move — Pre-payday check (hero) */}
        <section className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/90 p-4 text-primary-foreground shadow-lg shadow-primary/20">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
                Your next move
              </div>
              <p className="mt-0.5 text-sm font-semibold leading-snug">
                Run your pre-payday check — 30 seconds.
              </p>
            </div>
            <button
              onClick={() => setCheckOpen(true)}
              className="shrink-0 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-lg active:scale-95 transition-all"
            >
              Check my pay
            </button>
          </div>
        </section>


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
                £{Math.floor(earnedAnim)}
              </span>
              <span className="text-3xl font-bold opacity-85">
                .{(earnedAnim % 1).toFixed(2).slice(2)}
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

        {/* Goal ring strip — Eid trip progress */}
        <section className="mt-4 flex items-center gap-4 rounded-3xl bg-card p-4 ring-1 ring-border">
          <div className="relative size-16 shrink-0">
            <svg viewBox="0 0 64 64" className="size-full -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="var(--sand-deep)" strokeWidth="7" fill="none" />
              <circle
                cx="32" cy="32" r="26"
                stroke="var(--primary)" strokeWidth="7" fill="none" strokeLinecap="round"
                strokeDasharray={RC} strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center font-display text-sm font-extrabold tabular-nums text-ink">
              {Math.round(goalPctAnim)}%
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Target className="-mt-0.5 mr-1 inline size-3" />
              Eid trip goal
            </div>
            <div className="mt-0.5 font-display text-sm font-extrabold leading-snug text-ink">
              You're {Math.round(goalPctAnim)}% to your {fmt(USER.savingsGoal)} — keep going.
            </div>
            <div className="text-[11px] text-ink-soft tabular-nums">
              {fmt(balance)} saved · {fmt(USER.savingsGoal - balance)} to go
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-5 grid grid-cols-4 gap-2">
          <QuickAction
            icon={onBreak ? Play : Pause}
            label={onBreak ? "Clock in" : "Log break"}
            active={onBreak}
            onClick={() => {
              setOnBreak((b) => !b);
              flash(onBreak ? "Welcome back — your clock's ticking again" : "Break started — rest up, you've earned it");
            }}
          />
          <QuickAction
            icon={PiggyBank}
            label="Stash £5"
            onClick={() => {
              setSavedBoost((s) => s + 5);
              flash(`£5 tucked away for your Eid trip — kind to future you`);
              celebrate("£5 stashed");
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
              onClick={() => flash("Your week so far: 4 shifts · 34 hrs — strong work, Amina")}
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
          <p className="mt-3 text-center text-[11px] font-medium text-ink-soft">
            You're building, not behind — every shift counts.
          </p>
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
      <CelebrationToast />

      {/* Payslip translator overlay */}
      {payslipOpen && <PayslipTranslator onClose={() => setPayslipOpen(false)} />}

      {/* Pre-payday check overlay */}
      {checkOpen && <PrePaydayCheck onClose={() => setCheckOpen(false)} />}
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
// PRE-PAYDAY CHECK — the hero, empowering 4-point review.
type CheckPoint = {
  key: string;
  label: string;
  detail: string;
  status: "ok" | "flag";
  reassurance: string;
};

const CHECK_POINTS: CheckPoint[] = [
  {
    key: "hours",
    label: "Hours recorded",
    detail: "34h logged across 4 shifts — matches your rota.",
    status: "ok",
    reassurance: "Every hour you worked is on the timesheet.",
  },
  {
    key: "overtime",
    label: "Overtime",
    detail: "2h on Thursday evening — flagged, not yet on the rota.",
    status: "flag",
    reassurance: "Worth a polite note to payroll so it lands on Friday's payslip.",
  },
  {
    key: "rate",
    label: "Hourly rate",
    detail: "£14.50/hr — matches your contract.",
    status: "ok",
    reassurance: "No quiet rate change. Your number is your number.",
  },
  {
    key: "deductions",
    label: "Deductions",
    detail: "PAYE, NI and pension look right for £493 gross.",
    status: "ok",
    reassurance: "The take-home maths checks out: £398.02.",
  },
];

const PAYROLL_DRAFT = `Hi Payroll team,

Hope you're well. Quick one before Friday's payslip — I've got 2 hours of overtime on Thursday 5 Jun (8–10pm cover at Maple Care Home) that I don't think made it onto the rota. Could you take a look and add them in if so?

Thanks so much,
Amina`;

function PrePaydayCheck({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0); // 0..CHECK_POINTS.length -> scanning, then result
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState(PAYROLL_DRAFT);
  const [sent, setSent] = useState(false);

  // Animated scan: reveal one check every 600ms
  useEffect(() => {
    if (step >= CHECK_POINTS.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 350 : 700);
    return () => window.clearTimeout(t);
  }, [step]);

  const done = step >= CHECK_POINTS.length;
  const flagged = CHECK_POINTS.find((p) => p.status === "flag");
  const allClear = done && !flagged;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-sand">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Before Friday's payday
          </div>
          <div className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Pre-payday check
          </div>
        </div>
        <button
          onClick={onClose}
          className="grid size-10 place-items-center rounded-2xl bg-card ring-1 ring-border text-ink"
          aria-label="Close pre-payday check"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Intro */}
        <div className="rounded-2xl bg-primary-soft px-3.5 py-2.5 text-[11px] font-semibold text-primary flex items-center gap-2">
          <ShieldCheck className="size-3.5 shrink-0" />
          {done
            ? flagged
              ? "We found one small thing worth checking — nothing scary."
              : "All four checks passed. Go into payday calm."
            : "Running four friendly checks on this week's pay…"}
        </div>

        {/* Check list */}
        <ul className="mt-4 space-y-2">
          {CHECK_POINTS.map((p, i) => {
            const revealed = i < step;
            const isFlag = p.status === "flag";
            return (
              <li
                key={p.key}
                className={`rounded-2xl bg-card p-3.5 ring-1 transition-all ${
                  revealed
                    ? isFlag
                      ? "ring-accent/40"
                      : "ring-border"
                    : "ring-border opacity-50"
                } ${revealed ? "animate-in fade-in slide-in-from-bottom-1" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                      !revealed
                        ? "bg-sand-deep text-ink-soft"
                        : isFlag
                          ? "bg-accent-soft text-accent"
                          : "bg-primary-soft text-primary"
                    }`}
                  >
                    {!revealed ? (
                      <span className="block size-2 animate-pulse rounded-full bg-current" />
                    ) : isFlag ? (
                      <Info className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-ink">{p.label}</div>
                      {revealed && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isFlag ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"
                          }`}
                        >
                          {isFlag ? "Worth a look" : "Looks right"}
                        </span>
                      )}
                    </div>
                    {revealed && (
                      <>
                        <p className="mt-1 text-[13px] leading-snug text-ink">{p.detail}</p>
                        <p className="mt-1 text-[11px] leading-snug text-ink-soft">{p.reassurance}</p>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Result card */}
        {done && (
          <section
            className={`mt-5 overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
              allClear
                ? "bg-gradient-to-br from-primary to-primary/90 shadow-primary/20"
                : "bg-gradient-to-br from-accent to-accent/90 shadow-accent/20"
            }`}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-90">
              {allClear ? <CheckCircle2 className="size-4" /> : <Info className="size-4" />}
              {allClear ? "All clear" : "One small thing"}
            </div>
            <div className="mt-2 font-display text-2xl font-extrabold leading-tight">
              {allClear ? "Your pay looks right." : "Your pay's mostly right — one bit worth a polite check."}
            </div>
            <p className="mt-2 text-sm leading-relaxed opacity-95">
              {allClear
                ? `On track for ${fmt(TAKEHOME.net)} on Friday. Nothing to chase — go enjoy your weekend.`
                : `Your 2 hours of Thursday overtime aren't on the rota yet. A two-line message to payroll usually sorts it before Friday.`}
            </p>

            {!allClear && !draftOpen && (
              <button
                onClick={() => setDraftOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-accent shadow active:scale-95 transition-all"
              >
                Draft a polite message <ArrowUpRight className="size-4" />
              </button>
            )}
            {allClear && (
              <button
                onClick={() => {
                  celebrate("Pre-payday check complete");
                  onClose();
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow active:scale-95 transition-all"
              >
                Nice — I'm done <CheckCircle2 className="size-4" />
              </button>
            )}
          </section>
        )}

        {/* Draft message to payroll */}
        {done && flagged && draftOpen && (
          <section className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Polite draft · to Payroll
                </div>
                <div className="font-display text-base font-bold text-ink">Edit and send</div>
              </div>
              <div className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Pre-filled
              </div>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={9}
              className="mt-3 w-full resize-none rounded-2xl bg-sand p-3 text-[13px] leading-relaxed text-ink ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(draft).catch(() => {});
                  }
                  setSent(true);
                  celebrate("Message ready for payroll");
                }}
                className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow active:scale-95 transition-all"
              >
                {sent ? "Copied ✓" : "Copy message"}
              </button>
              <button
                onClick={() => {
                  setSent(true);
                  celebrate("Message sent to payroll");
                }}
                className="rounded-2xl bg-card px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-border active:scale-95 transition-all"
              >
                {sent ? "Sent ✓" : "Send to payroll"}
              </button>
              <button
                onClick={() => setDraftOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-ink-soft active:scale-95 transition-all"
              >
                Close draft
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              Tip: keep it short and kind. Payroll teams are people too — a polite note nearly always works.
            </p>
          </section>
        )}

        {/* Disclaimer */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold text-ink-soft ring-1 ring-border">
          <ShieldCheck className="size-3.5 text-primary" /> Flow Coach gives general information and estimates only — not financial, tax, legal, payroll or banking advice.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAY TAB
export function PayScreen({ onProfileClick }: { onProfileClick?: () => void }) {
  const max = Math.max(...WEEK.map((d) => d.earned), 1);
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="This week · estimate" name="Pay" small onProfileClick={onProfileClick} />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <GuidanceLine className="mb-3" />
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
      <CelebrationToast />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE TAB
export function SaveScreen({ onProfileClick }: { onProfileClick?: () => void }) {
  const { streak } = useStreak();
  const pct = (USER.savingsBalance / USER.savingsGoal) * 100;
  const C = 2 * Math.PI * 70;
  const offset = C - (pct / 100) * C;
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Gentle, automatic" name="Save" small onProfileClick={onProfileClick} />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Kindness banner */}
        <section className="mb-3 rounded-2xl bg-primary-soft px-4 py-3 text-center">
          <div className="font-display text-sm font-bold text-primary">
            You're building, not behind.
          </div>
          <div className="mt-0.5 text-[11px] text-primary/80">
            Every £ moves you closer — no shame in starting small.
          </div>
        </section>
        {/* Streak chip */}
        <section className="mb-4 rounded-3xl bg-gradient-to-br from-accent-soft to-primary-soft p-4 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/70">
              <Flame className="size-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-extrabold text-ink tabular-nums">
                {streak}-week saving streak
              </div>
              <div className="text-[11px] text-ink-soft">
                Come back tomorrow to keep your streak.
              </div>
            </div>
            <button
              onClick={() => celebrate("Streak kept — you're building, not behind")}
              className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow active:scale-95 transition-all"
            >
              Tick today
            </button>
          </div>
        </section>

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
      <CelebrationToast />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFE TAB
export function LifeScreen({ onProfileClick }: { onProfileClick?: () => void }) {
  const { streak } = useStreak();
  const [toast, setToast] = useState<string | null>(null);
  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2400);
  }
  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Small wins that add up" name="Life" small onProfileClick={onProfileClick} />
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
            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-bold text-ink tabular-nums">
                {streak} weeks of saving from every shift
              </div>
              <div className="text-xs text-ink-soft">Amina, you're building a habit that sticks</div>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-primary-soft px-3 py-2 text-center text-[11px] font-semibold text-primary">
            Come back tomorrow to keep your streak.
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
              onLearnMore={() => celebrate("Rail code on the way")}
            />
            <LifeCard
              tag="Wellbeing"
              title="2 free counselling sessions"
              body="Confidential support through your care provider's wellbeing fund."
              onLearnMore={() => celebrate("Booking link sent")}
            />
            <LifeCard
              tag="Skill up"
              title="Level 3 Care Cert · funded"
              body="Boost your hourly rate by ~£1.20. 12 weeks, evenings only."
              onLearnMore={() => celebrate("Enrolment saved")}
            />
            <LifeCard
              tag="Save on bills"
              title="Council Tax — check your band"
              body="1 in 5 carers are on the wrong band. 4-min check."
              onLearnMore={() => celebrate("Band check done")}
            />
            <LifeCard
              tag="Community"
              title="Carers' Sunday brunch · Hackney"
              body="Free brunch this Sunday. 14 carers going."
              onLearnMore={() => celebrate("You're on the list 🤍")}
            />
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-6">
          <div className="pointer-events-auto rounded-2xl bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </div>
        </div>
      )}
      <CelebrationToast />
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

export function CoachScreen({ onProfileClick }: { onProfileClick?: () => void }) {
  const [asked, setAsked] = useState<string[]>([]);
  const [checkOpen, setCheckOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(null), 2400);
  }


  return (
    <div className="flex h-full flex-col">
      <Header subtitle="Your weekly check-in" name="Flow Coach" small onProfileClick={onProfileClick} />
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

        {/* Pre-payday check — hero CTA */}
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div className="rounded-3xl rounded-tl-md bg-gradient-to-br from-primary-soft to-accent-soft p-4 ring-1 ring-primary/20">
            <p className="text-sm leading-relaxed text-ink">
              Want me to <span className="font-semibold">check your pay</span> before Friday? Four quick checks, 30 seconds — so you go into payday calm.
            </p>
            <div className="mt-3 flex gap-2">
              <ChipBtn primary onClick={() => setCheckOpen(true)}>Check my pay</ChipBtn>
              <ChipBtn onClick={() => flash("All good — I'm here when you want it")}>Maybe later</ChipBtn>
            </div>
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
              <ChipBtn primary onClick={() => celebrate("£12 added to Eid trip")}>Add £12 to goal</ChipBtn>
              <ChipBtn onClick={() => flash("No worries — I'll ask again next week")}>Not this week</ChipBtn>
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
              <ChipBtn primary onClick={() => celebrate("Reminder set for Friday 5pm")}>Yes, remind me</ChipBtn>
              <ChipBtn onClick={() => flash("Okay — I'll leave it with you")}>Not needed</ChipBtn>
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

        {/* Bring PayFlow to workplace */}
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div className="rounded-3xl rounded-tl-md bg-gradient-to-br from-primary to-primary/90 p-4 text-primary-foreground shadow-lg shadow-primary/20">
            <p className="text-sm leading-relaxed opacity-95">
              Get your shifts and pay clear for everyone — <span className="font-semibold">takes your manager 2 minutes</span>.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  const draft = "Hi, I wanted to share PayFlow — a free app that helps hourly workers like our team see shifts and pay clearly in real time. It only takes a couple of minutes to set up. Would you be open to taking a look? Thanks, Amina";
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(draft).catch(() => {});
                  }
                  celebrate("Manager invite copied");
                }}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white text-primary shadow active:scale-95 transition-all"
              >
                Invite manager
              </button>
              <button
                onClick={() => {
                  const text = "I'm using PayFlow to track my shifts and pay in real time. It's free and made for hourly workers like us. Want to try it?";
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: "PayFlow", text }).catch(() => {});
                  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(text).catch(() => {});
                  }
                  celebrate("Invite shared with a coworker");
                }}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 active:scale-95 transition-all"
              >
                Invite coworker
              </button>
            </div>
          </div>
        </div>

        {/* User reply prompt */}
        <button
          onClick={() => flash("Pick a suggestion above — Flow Coach replies in plain, kind English")}
          className="sticky bottom-2 w-full rounded-full bg-card px-4 py-3 ring-1 ring-border flex items-center gap-2 shadow-sm active:scale-[0.99] transition-transform text-left"
        >
          <span className="text-sm text-ink-soft flex-1">Ask Flow Coach anything…</span>
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <ArrowUpRight className="size-4" />
          </span>
        </button>

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

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-6">
          <div className="pointer-events-auto rounded-2xl bg-ink px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </div>
        </div>
      )}
      <CelebrationToast />

      {/* Pre-payday check overlay */}
      {checkOpen && <PrePaydayCheck onClose={() => setCheckOpen(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE SCREEN
export function ProfileScreen({ onClose }: { onClose: () => void }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copiedManager, setCopiedManager] = useState(false);
  const [copiedCoworker, setCopiedCoworker] = useState(false);

  const managerDraft = `Hi,

I wanted to share PayFlow — a free app that helps hourly workers like our team see shifts and pay clearly in real time.

It only takes a couple of minutes to set up and it could really help everyone understand their rota and take-home better.

Would you be open to taking a look?

Thanks,
Amina`;

  const coworkerText = "I'm using PayFlow to track my shifts and pay in real time. It's free and made for hourly workers like us. Want to try it?";

  const shareCoworker = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "PayFlow", text: coworkerText }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(coworkerText).catch(() => {});
      setCopiedCoworker(true);
      setTimeout(() => setCopiedCoworker(false), 2000);
    }
    celebrate("Invite shared with a coworker");
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-sand">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Your profile</div>
          <div className="font-display text-2xl font-extrabold tracking-tight text-ink">Profile</div>
        </div>
        <button
          onClick={onClose}
          className="grid size-10 place-items-center rounded-2xl bg-card ring-1 ring-border text-ink"
          aria-label="Close profile"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
        {/* User card */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
              A
            </div>
            <div>
              <div className="font-display text-lg font-bold text-ink">{USER.name}</div>
              <div className="text-sm text-ink-soft">Care worker · Maple Care Home</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                <ShieldCheck className="size-3" /> Verified
              </div>
            </div>
          </div>
        </section>

        {/* Employer pull — hero card */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/90 p-5 text-primary-foreground shadow-lg shadow-primary/20">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-90">
            <Building2 className="size-4" /> For your whole team
          </div>
          <div className="mt-2 font-display text-xl font-extrabold leading-tight">
            Bring PayFlow to your workplace
          </div>
          <p className="mt-2 text-sm leading-relaxed opacity-95">
            Get your shifts and pay clear for everyone — <span className="font-semibold">takes your manager 2 minutes</span>.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow active:scale-95 transition-all"
          >
            Invite my manager <ArrowUpRight className="size-4" />
          </button>
        </section>

        {/* Invite a coworker */}
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent-soft">
              <Users className="size-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-bold text-ink">Invite a coworker</div>
              <p className="text-sm text-ink-soft">Share PayFlow with someone on your team.</p>
            </div>
            <button
              onClick={shareCoworker}
              className="shrink-0 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground shadow active:scale-95 transition-all"
            >
              {copiedCoworker ? "Copied ✓" : "Share"}
            </button>
          </div>
        </section>

        {/* Manager invite expanded */}
        {inviteOpen && (
          <section className="rounded-3xl bg-card p-5 ring-1 ring-border animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Pre-filled draft</div>
                <div className="font-display text-base font-bold text-ink">To your manager</div>
              </div>
              <div className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Ready to send
              </div>
            </div>
            <textarea
              readOnly
              rows={8}
              className="mt-3 w-full resize-none rounded-2xl bg-sand p-3 text-[13px] leading-relaxed text-ink ring-1 ring-border focus:outline-none"
              value={managerDraft}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(managerDraft).catch(() => {});
                  }
                  setCopiedManager(true);
                  celebrate("Manager invite copied");
                  setTimeout(() => setCopiedManager(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow active:scale-95 transition-all"
              >
                {copiedManager ? "Copied ✓" : <><Copy className="size-3.5" /> Copy message</>}
              </button>
              <button
                onClick={() => {
                  celebrate("Invite sent to manager");
                  setInviteOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-card px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-border active:scale-95 transition-all"
              >
                <Send className="size-3.5" /> Send
              </button>
              <button
                onClick={() => setInviteOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-ink-soft active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              Tip: a short, kind message works best. Most managers are happy to explore tools that help the team.
            </p>
          </section>
        )}

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
function Header({ name, subtitle, small, onProfileClick }: { name: string; subtitle: string; small?: boolean; onProfileClick?: () => void }) {
  const { streak } = useStreak();
  return (
    <div className="px-5 pt-12 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {subtitle}
          </div>
          <div className={`font-display font-extrabold tracking-tight text-ink ${small ? "text-2xl" : "text-3xl"}`}>
            {small ? name : `Hi, ${name}`}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            title={`${streak}-week saving streak`}
            className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent ring-1 ring-accent/20"
          >
            <Flame className="size-3.5" />
            <span className="tabular-nums">{streak} wk</span>
          </div>
          <button
            onClick={onProfileClick}
            className="grid size-11 place-items-center rounded-2xl bg-primary-soft font-display text-base font-bold text-primary ring-1 ring-primary/10 active:scale-95 transition-transform"
          >
            A
          </button>
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

function LifeCard({ tag, title, body, accent, onLearnMore }: { tag: string; title: string; body: string; accent?: boolean; onLearnMore?: () => void }) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${accent ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"}`}>
        {tag}
      </span>
      <div className="mt-2.5 font-display text-base font-bold leading-snug text-ink">{title}</div>
      <p className="mt-1 text-sm leading-snug text-ink-soft">{body}</p>
      <button
        onClick={onLearnMore}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary active:scale-95 transition-transform"
      >
        Learn more <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

function ChipBtn({ primary, children, onClick }: { primary?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-all active:scale-95 ${primary ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-ink ring-border hover:bg-primary-soft"}`}
    >
      {children}
    </button>
  );
}

// Re-export Quote for landing page use (lucide doesn't always include it consistently)
export { Quote };
