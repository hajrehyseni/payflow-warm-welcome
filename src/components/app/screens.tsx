import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore, store, startShift, endShift, toggleBreak, liveElapsedMs, liveEarnings, weeklyTotals, addShift, deleteShift, editShift, restoreShift, setSaveRule, addToSavings, withdrawFromSavings, toggleSavePaused, updateSettings, applySetup, computeNextPayday, type SaveRule, type Shift, type PayCycle } from "@/lib/payflow/store";
import { estimateDeductions, gbp, fmtHours, fmtClock, daysUntil } from "@/lib/payflow/calc";
import { useAuth, signOut } from "@/lib/payflow/auth";
import { Play, Square, Pause, Plus, Clock, Wallet, PiggyBank, Sparkles, Heart, X, Copy, Check, ChevronRight, AlertCircle, ShieldCheck, TrendingUp, Calendar, FileText, MessageSquare, User, Trash2, Coffee, Flame, CloudUpload, Pencil, FileCheck2, Settings, HelpCircle, LogOut, PauseCircle, PlayCircle, Info } from "lucide-react";
import { PayCheckModal } from "@/components/payflow/PayCheckModal";
import { WeeklyRecap, useWeeklyRecap } from "@/components/payflow/WeeklyRecap";

// ---------------- Helpers: greeting + streak ----------------

function greetingFor(opts: { name?: string; onShift: boolean; onBreak: boolean; hasEndedToday: boolean; hour: number }) {
  const { name, onShift, onBreak, hasEndedToday, hour } = opts;
  const who = name ? `, ${name.split(" ")[0]}` : "";
  if (onShift && onBreak) return { title: `Enjoy your break${who}`, sub: "The clock's paused — back when you're ready." };
  if (onShift) return { title: `You're earning now${who}`, sub: "Steady as you go. We're tracking every minute." };
  if (hasEndedToday) return { title: `Nice work today${who}`, sub: "Let's see what you made." };
  if (hour < 5) return { title: `Hello${who}`, sub: "Quiet hours. Take it easy when you can." };
  if (hour < 12) return { title: `Morning${who}`, sub: "Ready for today's shift?" };
  if (hour < 17) return { title: `Afternoon${who}`, sub: "Hope the day's going kindly." };
  if (hour < 22) return { title: `Evening${who}`, sub: "How did today land for you?" };
  return { title: `Hi${who}`, sub: "Winding down — well done today." };
}

function computeStreak(shifts: { date: string }[]) {
  if (!shifts.length) return 0;
  const set = new Set(shifts.map((s) => s.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // Allow streak to "carry" if no shift today yet, by starting from yesterday.
  let cursor = new Date(today);
  if (!set.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ---------------- Shared bits ----------------



// ---------------- Shared bits ----------------

export function AppHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-sand/95 backdrop-blur-xl border-b border-border/60 px-5 pt-[max(env(safe-area-inset-top),0.5rem)] pb-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-ink-soft">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Compliance({ short = false }: { short?: boolean }) {
  return (
    <div className="mx-5 mt-4 mb-2 flex items-start gap-2 rounded-2xl bg-card p-3 ring-1 ring-border">
      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <p className="text-[11px] leading-snug text-ink-soft">
        {short
          ? "Estimates only. Your actual payslip may differ."
          : "PayFlow gives estimates only. It does not provide tax, legal, payroll, banking, investment or financial advice. Your actual payslip may differ."}
      </p>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "", disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "ink" | "danger" | "accent"; className?: string; disabled?: boolean; type?: "button" | "submit" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:opacity-95",
    accent: "bg-accent text-accent-foreground hover:opacity-95",
    ink: "bg-ink text-sand hover:opacity-95",
    ghost: "bg-card text-ink ring-1 ring-border hover:bg-sand-deep",
    danger: "bg-destructive text-destructive-foreground hover:opacity-95",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${v} ${className}`}
    >
      {children}
    </button>
  );
}

// ---------------- TODAY ----------------

export function TodayScreen({ goToTab }: { goToTab?: (t: string) => void }) {
  const live = useStore((s) => s.live);
  const shifts = useStore((s) => s.shifts);
  const saved = useStore((s) => s.savedTotal);
  const nextPayday = useStore((s) => s.nextPayday);
  const usingSample = useStore((s) => s.usingSampleData);
  const week = weeklyTotals(shifts);
  const ded = estimateDeductions(week.gross);
  const user = useAuth();
  const [now, setNow] = useState(Date.now());
  const [setupOpen, setSetupOpen] = useState(false);
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const recap = useWeeklyRecap();
  const [recapOpen, setRecapOpen] = useState(false);
  useEffect(() => { if (recap) setRecapOpen(true); }, [recap?.weekISO]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), live.active ? 1000 : 60000);
    return () => clearInterval(id);
  }, [live.active]);

  const elapsedMs = liveElapsedMs(live, now);
  const earned = liveEarnings(live, now);
  const onBreak = !!live.pausedAt;

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [now]);
  const hasEndedToday = shifts.some((s) => s.date === today);
  const hour = new Date(now).getHours();
  const g = greetingFor({ name: user?.name, onShift: live.active, onBreak, hasEndedToday, hour });

  const payday = new Date(nextPayday + "T00:00:00");
  const daysToPay = daysUntil(payday);
  const paydayLabel = payday.toLocaleDateString("en-GB", { weekday: "short" });
  const streak = useMemo(() => computeStreak(shifts), [shifts]);





  function handleEnd() {
    const elapsedNow = elapsedMs;
    const earnedNow = earned;
    endShift();
    const hrs = elapsedNow / 3600000;
    if (hrs < 0.02) return; // store doesn't insert micro-shifts
    // The shift was just unshifted onto the list inside endShift().
    const saved = store.get().shifts[0];
    const summary = `${fmtHours(hrs)} · ${gbp(earnedNow)}`;
    toast.success(`Shift saved · ${summary}`, {
      description: "Added to your week. Nice work.",
      duration: 6000,
      action: saved ? {
        label: "Undo",
        onClick: () => { deleteShift(saved.id); toast("Shift removed", { description: "Back to where you were." }); },
      } : undefined,
    });
  }

  function handleSave() {
    if (!user) {
      toast("Sign in to keep your savings safe", {
        description: "Create a free account to save your shifts and savings across devices.",
        action: { label: "Sign in", onClick: () => { window.location.href = "/login"; } },
      });
    }
    goToTab?.("save");
  }

  const latest = shifts[0];
  const recentShifts = shifts.slice(0, 3);
  const [showJourney, setShowJourney] = useState(true);

  const dateLabel = new Date(now).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  // One calm next-step sentence (Monzo-style caption under the big number).
  type Next = { tone: "primary" | "money" | "accent"; text: string; cta?: { label: string; onClick: () => void } };
  const nextStep: Next = (() => {
    if (live.active && onBreak) return { tone: "primary", text: "Enjoy your break ☕ Tap Resume when you’re back." };
    if (live.active) return { tone: "primary", text: "You’re on the clock — keep going, then end your shift when you finish." };
    if (hasEndedToday) {
      if (daysToPay <= 2) return { tone: "money", text: "Nice one — shift saved ✅ Payslip due soon.", cta: { label: "Check payslip", onClick: () => setPayCheckOpen(true) } };
      return { tone: "money", text: "Nice one — shift saved ✅ You’re done for now." };
    }
    if (daysToPay <= 2) return { tone: "primary", text: `Payday ${paydayLabel} 💷 Payslip arrived? Check it against your hours.`, cta: { label: "Check payslip", onClick: () => setPayCheckOpen(true) } };
    return { tone: "primary", text: "Whenever you’re ready 👋 Tap Start shift when you clock on." };
  })();

  return (
    <div className="pb-[104px]">
      {/* Monzo-style header: greeting + date, calm */}
      <header className="sticky top-0 z-30 bg-sand/95 backdrop-blur-xl border-b border-border/60 px-5 pt-[max(env(safe-area-inset-top),0.5rem)] pb-3">
        <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight">{g.title}</h1>
        <p className="text-[12px] text-ink-soft leading-tight truncate">{dateLabel}</p>
      </header>

      {usingSample && (
        <section className="mx-4 mt-3">
          <button
            onClick={() => setSetupOpen(true)}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-accent-soft px-3 py-1.5 ring-1 ring-accent/20 text-left"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-accent truncate">Showing sample data — tap to use yours</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-bold text-accent-foreground shrink-0">
              <Pencil className="size-3" /> Use mine
            </span>
          </button>
        </section>
      )}

      {setupOpen && <SetupWizard onClose={() => setSetupOpen(false)} initial={{ hourlyRate: live.hourlyRate, workplace: live.workplace }} />}

      {/* Hero card — big number first, calm next-step caption underneath */}
      <section className="mx-4 mt-3">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-ink p-5 text-sand shadow-[0_14px_34px_-20px_rgba(36,90,180,0.45)]">
          <div className="flex items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] opacity-85">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <span className={`size-1.5 rounded-full ${live.active && !onBreak ? "bg-accent animate-pulse-dot" : "bg-white/50"}`} />
              <span className="truncate">{live.active ? (onBreak ? "On break" : "On shift") : "Today"}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {streak >= 2 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/90 text-accent-foreground px-1.5 py-0.5 text-[10px] normal-case tracking-normal">
                  🔥 {streak}-day
                </span>
              )}
              <span className="truncate">{gbp(live.hourlyRate)}/hr</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="font-display text-[42px] font-extrabold tracking-tight leading-none tabular-nums">
              {gbp(earned)}
            </div>
            <div className="text-[12.5px] opacity-85 tabular-nums pb-1">{fmtClock(elapsedMs)}</div>
          </div>

          <div className="mt-1 text-[11px] opacity-75 leading-tight">
            {live.active ? (onBreak ? "Paused · clock resumes when you tap Resume" : "Live · earning right now") : `Estimate · ${freshnessLabel(now)}`}
          </div>


          {/* Calm next-step caption — single guiding sentence */}
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 py-2">
            <p className="flex-1 text-[12px] leading-snug text-sand/95 font-medium">{nextStep.text}</p>
            {nextStep.cta && (
              <button
                onClick={nextStep.cta.onClick}
                className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-sand text-primary px-2.5 py-1 text-[11px] font-bold active:scale-[0.97]"
              >
                {nextStep.cta.label} <ChevronRight className="size-3" />
              </button>
            )}
          </div>

          <div className="mt-3">
            {!live.active ? (
              <button
                onClick={() => { startShift(); toast("Shift started", { description: "Earning live. Take breaks when you need them." }); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent text-accent-foreground px-4 py-3.5 text-[15px] font-bold active:scale-[0.97] transition-transform shadow-[0_8px_18px_-10px_rgba(255,102,90,0.7)]"
              >
                <Play className="size-4" fill="currentColor" /> Start shift
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEnd}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-accent text-accent-foreground px-3 py-3 text-[14px] font-bold active:scale-[0.97] transition-transform"
                >
                  <Square className="size-3.5" fill="currentColor" /> End shift
                </button>
                <button
                  onClick={toggleBreak}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 text-sand ring-1 ring-white/15 px-3 py-3 text-[14px] font-bold active:scale-[0.97] transition-transform"
                >
                  {onBreak ? <><Play className="size-3.5" fill="currentColor" /> Resume</> : <><Coffee className="size-3.5" /> Break</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Journey strip — only for brand-new users, dismissible */}
      {shifts.length === 0 && showJourney && (
        <section className="mx-4 mt-2.5">
          <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 ring-1 ring-border">
            <span className="text-[10.5px] font-bold text-ink-soft uppercase tracking-wider shrink-0">How it works</span>
            <div className="flex items-center gap-1 flex-1 min-w-0 text-[11px] font-bold text-ink">
              <span className="inline-flex items-center gap-1"><span className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px]">1</span>Start</span>
              <ChevronRight className="size-3 text-ink-soft shrink-0" />
              <span className="inline-flex items-center gap-1"><span className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px]">2</span>End</span>
              <ChevronRight className="size-3 text-ink-soft shrink-0" />
              <span className="inline-flex items-center gap-1"><span className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px]">3</span>Check payslip</span>
            </div>
            <button onClick={() => setShowJourney(false)} aria-label="Dismiss" className="grid size-6 place-items-center rounded-full text-ink-soft hover:bg-sand-deep shrink-0">
              <X className="size-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* This week — Monzo Pot-style money summary */}
      <section className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <h2 className="text-[10.5px] font-bold text-ink-soft uppercase tracking-[0.14em]">This week</h2>
          <span className="text-[10.5px] text-ink-soft">Estimate</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="row-span-2 rounded-2xl bg-money text-money-foreground p-4 shadow-[0_8px_20px_-14px_rgba(20,120,90,0.55)] relative overflow-hidden">
            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-white/40" />
            <div className="text-[10.5px] font-bold uppercase tracking-wider opacity-90">Take-home</div>
            <div className="mt-1.5 font-display text-[28px] font-extrabold tracking-tight tabular-nums leading-none">{gbp(ded.net)}</div>
            <div className="mt-2 text-[11px] opacity-90 leading-snug">{week.count} shift{week.count === 1 ? "" : "s"} this week</div>
          </div>
          <MiniStat label="Hours" value={fmtHours(week.hours)} />
          <MiniStat label="Saved" value={gbp(saved)} money />
        </div>
      </section>

      {/* Main actions */}
      <section className="mx-4 mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setPayCheckOpen(true)}
          className="flex items-center gap-2.5 rounded-2xl bg-card p-3.5 ring-1 ring-border text-left active:scale-[0.98] transition-transform"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0"><FileCheck2 className="size-4" /></div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold leading-tight">Check payslip</div>
            <div className="text-[11px] text-ink-soft leading-tight truncate">When your payslip arrives</div>
          </div>
        </button>
        <button
          onClick={() => goToTab?.("pay")}
          className="flex items-center gap-2.5 rounded-2xl bg-card p-3.5 ring-1 ring-border text-left active:scale-[0.98] transition-transform"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary shrink-0"><Plus className="size-4" /></div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold leading-tight">Add a shift</div>
            <div className="text-[11px] text-ink-soft leading-tight truncate">If you forgot to start one</div>
          </div>
        </button>
      </section>

      {payCheckOpen && <PayCheckModal onClose={() => setPayCheckOpen(false)} />}
      {recap && recapOpen && <WeeklyRecap data={recap} onClose={() => setRecapOpen(false)} />}

      {/* Recent shifts — Monzo feed-style with emoji avatars */}
      <section className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <h2 className="text-[10.5px] font-bold text-ink-soft uppercase tracking-[0.14em]">Recent shifts</h2>
          {shifts.length > 0 && (
            <button onClick={() => goToTab?.("pay")} className="text-[11px] font-bold text-primary inline-flex items-center gap-0.5">
              See all <ChevronRight className="size-3" />
            </button>
          )}
        </div>
        {recentShifts.length > 0 ? (
          <ul className="space-y-2">
            {recentShifts.map((s) => (
              <li key={s.id}>
                <button onClick={() => setEditShift(s)} className="w-full flex items-center gap-2.5 rounded-2xl bg-card p-3 ring-1 ring-border text-left active:scale-[0.99] transition-transform">
                  <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-[16px] shrink-0" aria-hidden>
                    {shiftEmoji(s.workplace)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold leading-tight">{s.workplace}</div>
                    <div className="text-[11.5px] text-ink-soft leading-tight truncate">{shiftWhen(s)} · {fmtHours(s.hours)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="font-display text-[15px] font-extrabold tabular-nums text-money">+{gbp(s.gross)}</div>
                    <Pencil className="size-3.5 text-ink-soft shrink-0" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border text-center text-[12.5px] text-ink-soft">
            Your finished shifts will appear here, like a little payday diary.
          </div>
        )}
      </section>

      {editShift && <EditShiftModal shift={editShift} onClose={() => setEditShift(null)} />}


      {/* Compact disclaimer */}
      <p className="mx-4 mt-3 text-[11px] text-ink-soft text-center leading-snug">
        Estimates only. Your actual payslip may differ.
      </p>
    </div>
  );
}

// Freshness label for the hero estimate stamp
function freshnessLabel(now: number): string {
  // Simple "Updated just now" — tied to the polling tick so it refreshes the user's sense of liveness.
  const sec = Math.floor((Date.now() - now) / 1000);
  if (sec < 30) return "Updated just now";
  if (sec < 120) return "Updated a minute ago";
  const min = Math.floor(sec / 60);
  if (min < 60) return `Updated ${min} min ago`;
  return "Updated recently";
}

// Emoji + when helpers for the Recent shifts feed
function shiftEmoji(workplace?: string): string {
  const w = (workplace || "").toLowerCase();
  if (/care|nurs|hosp|clinic|nhs/.test(w)) return "🏥";
  if (/clean/.test(w)) return "🧹";
  if (/secur|guard|door/.test(w)) return "🛡️";
  if (/warehouse|amazon|pick|pack|depot/.test(w)) return "📦";
  if (/bar|pub|restaurant|cafe|kitchen|hospitality|hotel|wait/.test(w)) return "🍽️";
  if (/deliver|driver|uber|courier/.test(w)) return "🛵";
  if (/retail|shop|store/.test(w)) return "🛍️";
  if (/build|construct|site/.test(w)) return "🛠️";
  return "⏱️";
}

function shiftWhen(s: Shift): string {
  const d = new Date(s.date + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  const start = parseInt((s.start || "").split(":")[0] || "0", 10);
  const part = start < 6 ? "night" : start < 12 ? "morning" : start < 17 ? "afternoon" : "evening";
  if (diffDays === 0) return `Today ${part}`;
  if (diffDays === 1) return `Yesterday ${part}`;
  if (diffDays < 7) return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${part}`;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}




function Tile({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-80">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, accent, money }: { label: string; value: string; accent?: boolean; money?: boolean }) {
  const tone = money
    ? "bg-money text-money-foreground ring-transparent"
    : accent
      ? "bg-primary text-primary-foreground ring-transparent"
      : "bg-card ring-border";
  return (
    <div className={`rounded-2xl px-3 py-2.5 ring-1 ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">{label}</div>
      <div className="mt-0.5 font-display text-[17px] font-extrabold tracking-tight tabular-nums truncate">{value}</div>
    </div>
  );
}


function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 ring-1 ring-border active:scale-[0.97] transition-transform">
      <div className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-4" /></div>
      <span className="text-[12px] font-bold text-ink">{label}</span>
    </button>
  );
}

function ShiftRow({ s, onDelete }: { s: Shift; onDelete?: () => void }) {
  const d = new Date(s.date + "T00:00:00");
  const dayLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border">
      <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Clock className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold">{s.workplace}</div>
        <div className="text-[12px] text-ink-soft">{dayLabel} · {fmtHours(s.hours)} · {s.start}–{s.end}</div>
      </div>
      <div className="text-right">
        <div className="font-display text-[15px] font-extrabold tabular-nums">{gbp(s.gross)}</div>
        {onDelete && (
          <button onClick={onDelete} className="mt-0.5 text-[11px] text-ink-soft hover:text-destructive inline-flex items-center gap-1">
            <Trash2 className="size-3" /> Remove
          </button>
        )}
      </div>
    </li>
  );
}

// ---------------- PAY ----------------

type PayModal = null | "add" | "forecast" | "payslip" | "query";

export function PayScreen() {
  const shifts = useStore((s) => s.shifts);
  const nextPayday = useStore((s) => s.nextPayday);
  const week = weeklyTotals(shifts);
  const ded = estimateDeductions(week.gross);
  const payday = new Date(nextPayday + "T00:00:00");
  const daysToPay = daysUntil(payday);
  const confidence = Math.min(100, Math.round((week.count >= 4 ? 90 : 60 + week.count * 7)));

  const [modal, setModal] = useState<PayModal>(null);
  const [payCheckOpen, setPayCheckOpen] = useState(false);
  const payChecks = useStore((s) => s.payChecks);
  const lastCheck = payChecks[0];

  return (
    <div className="pb-[120px]">
      <AppHeader title="Pay" subtitle={`Next payday · Fri (${daysToPay} day${daysToPay === 1 ? "" : "s"})`} />

      {/* Hero */}
      <section className="mx-5 mt-5">
        <div className="rounded-[28px] bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">Estimated take-home this week</div>
          <div className="mt-2 font-display text-[52px] font-extrabold tracking-tight tabular-nums leading-none">{gbp(ded.net)}</div>
          <div className="mt-2 text-sm opacity-90">{fmtHours(week.hours)} · gross {gbp(ded.gross)}</div>

          <div className="mt-5 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
            <Row k="PAYE income tax" v={`− ${gbp(ded.tax)}`} />
            <Row k="National Insurance" v={`− ${gbp(ded.ni)}`} />
            <Row k="Pension (5%)" v={`− ${gbp(ded.pension)}`} last />
          </div>
        </div>
      </section>

      {/* Confidence */}
      <section className="mx-5 mt-4 rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-bold">Pay confidence</div>
          <div className="text-[13px] font-bold tabular-nums">{confidence}%</div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sand-deep">
          <div className="h-full rounded-full bg-primary" style={{ width: `${confidence}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-ink-soft">
          Based on {week.count} shift{week.count === 1 ? "" : "s"} this week. Log every shift to keep this accurate.
        </p>
      </section>

      {/* Check my pay — hero card */}
      <section className="mx-5 mt-4">
        <button onClick={() => setPayCheckOpen(true)} className="w-full flex items-center gap-3 rounded-2xl bg-accent-soft p-4 ring-1 ring-accent/20 text-left active:scale-[0.99] transition">
          <div className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground"><FileCheck2 className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-ink">Check my pay</div>
            <div className="text-[12px] text-ink-soft truncate">
              {lastCheck
                ? lastCheck.looksRight ? "Last check looked right ✓" : `Last check: ${gbp(Math.abs(lastCheck.gapNet))} ${lastCheck.gapNet > 0 ? "short" : "over"}`
                : "Compare your payslip to what you tracked."}
            </div>
          </div>
          <ChevronRight className="size-4 text-ink-soft" />
        </button>
      </section>

      {/* Actions */}
      <section className="mx-5 mt-4 grid grid-cols-2 gap-2">
        <Btn variant="ink" onClick={() => setModal("add")}><Plus className="size-4" /> Add shift</Btn>
        <Btn variant="ghost" onClick={() => setModal("forecast")}><TrendingUp className="size-4" /> Pay forecast</Btn>
        <Btn variant="ghost" onClick={() => setModal("payslip")}><FileText className="size-4" /> Payslip translator</Btn>
        <Btn variant="ghost" onClick={() => setModal("query")}><MessageSquare className="size-4" /> Payroll query</Btn>
      </section>

      {payCheckOpen && <PayCheckModal onClose={() => setPayCheckOpen(false)} />}
      <section className="mx-5 mt-6">
        <h2 className="text-[13px] font-bold text-ink-soft uppercase tracking-wider mb-2">Shift history</h2>
        {shifts.length === 0 ? (
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border text-center text-sm text-ink-soft">
            No shifts logged yet. Tap Add shift to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {shifts.map((s) => <ShiftRow key={s.id} s={s} onDelete={() => deleteShift(s.id)} />)}
          </ul>
        )}
      </section>

      <Compliance />

      {modal === "add" && <AddShiftModal onClose={() => setModal(null)} />}
      {modal === "forecast" && <ForecastModal onClose={() => setModal(null)} />}
      {modal === "payslip" && <PayslipModal onClose={() => setModal(null)} ded={ded} hours={week.hours} />}
      {modal === "query" && <PayrollQueryModal onClose={() => setModal(null)} />}
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${last ? "" : "border-b border-white/10"}`}>
      <span className="text-[13px] opacity-90">{k}</span>
      <span className="text-[14px] font-bold tabular-nums">{v}</span>
    </div>
  );
}

// ---------------- Modals ----------------

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-sand rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-sand/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between border-b border-border/60">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-card ring-1 ring-border"><X className="size-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-ink-soft mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-2xl bg-card px-4 py-3 ring-1 ring-border text-[15px] focus:outline-none focus:ring-2 focus:ring-primary";

function AddShiftModal({ onClose }: { onClose: () => void }) {
  const def = useStore((s) => ({ wp: s.workplaceDefault, rate: s.hourlyRateDefault }));
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    workplace: def.wp, date: today, start: "09:00", end: "17:00", breakMins: 30, hourlyRate: def.rate, notes: "",
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workplace.trim()) return setErr("Please add a workplace.");
    if (!form.start || !form.end) return setErr("Please add start and end times.");
    if (form.hourlyRate <= 0) return setErr("Hourly rate must be more than £0.");
    addShift({ ...form, breakMins: Number(form.breakMins) || 0, hourlyRate: Number(form.hourlyRate) });
    onClose();
  };

  return (
    <Modal title="Add shift" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Workplace"><input className={inputCls} value={form.workplace} onChange={(e) => setForm({ ...form, workplace: e.target.value })} maxLength={60} /></Field>
        <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start"><input type="time" className={inputCls} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
          <Field label="End"><input type="time" className={inputCls} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Break (mins)"><input type="number" min={0} max={240} className={inputCls} value={form.breakMins} onChange={(e) => setForm({ ...form, breakMins: Number(e.target.value) })} /></Field>
          <Field label="Hourly rate (£)"><input type="number" min={0} step="0.01" className={inputCls} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Notes (optional)"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={200} /></Field>
        {err && <div className="rounded-xl bg-destructive/10 text-destructive px-3 py-2 text-sm flex items-center gap-2"><AlertCircle className="size-4" /> {err}</div>}
        <Btn type="submit" className="w-full"><Check className="size-4" /> Save shift</Btn>
      </form>
    </Modal>
  );
}

function ForecastModal({ onClose }: { onClose: () => void }) {
  const shifts = useStore((s) => s.shifts);
  const week = weeklyTotals(shifts);
  const ded = estimateDeductions(week.gross);
  const monthly = ded.net * 4.33;
  const yearly = ded.net * 52;
  return (
    <Modal title="Pay forecast" onClose={onClose}>
      <p className="text-[13px] text-ink-soft mb-4">If your current week's pattern continues, here's a rough picture.</p>
      <div className="space-y-2">
        <Stat label="This week (take-home)" v={gbp(ded.net)} />
        <Stat label="Estimated monthly" v={gbp(monthly)} />
        <Stat label="Estimated yearly" v={gbp(yearly)} />
      </div>
      <p className="mt-4 text-[11px] text-ink-soft">PayFlow gives estimates only. Your actual pay may differ depending on tax code, overtime and other factors.</p>
    </Modal>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4 ring-1 ring-border">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className="font-display text-lg font-extrabold tabular-nums">{v}</span>
    </div>
  );
}

function PayslipModal({ onClose, ded, hours }: { onClose: () => void; ded: ReturnType<typeof estimateDeductions>; hours: number }) {
  const items: { k: string; v: string; what: string }[] = [
    { k: "Gross pay", v: gbp(ded.gross), what: "Total earned before deductions — your hourly rate × hours worked." },
    { k: "PAYE income tax", v: gbp(ded.tax), what: "Tax taken from your pay by your employer and sent to HMRC. Based on your tax code." },
    { k: "National Insurance", v: gbp(ded.ni), what: "A separate UK contribution that builds up your State Pension and benefits." },
    { k: "Pension", v: gbp(ded.pension), what: "Your contribution to your workplace pension (auto-enrolment minimum 5%)." },
    { k: "Net pay (take-home)", v: gbp(ded.net), what: "What actually lands in your bank account on payday." },
  ];
  return (
    <Modal title="Payslip translator" onClose={onClose}>
      <p className="text-[13px] text-ink-soft mb-3">Plain English meaning of each line on your payslip.</p>
      <p className="text-[12px] text-ink-soft mb-3">Based on {fmtHours(hours)} this week.</p>
      <div className="space-y-2.5">
        {items.map((i) => (
          <div key={i.k} className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold">{i.k}</span>
              <span className="font-display text-[15px] font-extrabold tabular-nums">{i.v}</span>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-soft leading-snug">{i.what}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------------- Payroll Query ----------------

type QueryIssue = "missing-hours" | "wrong-rate" | "overtime" | "holiday" | "deduction" | "missing-payslip";

const ISSUES: { id: QueryIssue; label: string }[] = [
  { id: "missing-hours", label: "Missing hours" },
  { id: "wrong-rate", label: "Wrong hourly rate" },
  { id: "overtime", label: "Overtime missing" },
  { id: "holiday", label: "Holiday pay question" },
  { id: "deduction", label: "Deduction unclear" },
  { id: "missing-payslip", label: "Payslip missing" },
];

function messageFor(issue: QueryIssue) {
  const sign = "\n\nKind regards,\n[Your name]";
  switch (issue) {
    case "missing-hours":
      return `Hello payroll team,\n\nI hope you're well. I think there may be some hours missing from my latest payslip. According to my records I worked [hours] hours during the pay period [dates], but my payslip shows fewer.\n\nCould you please check this when you have a moment and let me know what you find? I'm happy to share my shift log.${sign}`;
    case "wrong-rate":
      return `Hello payroll team,\n\nI hope you're well. I think the hourly rate used on my latest payslip may be incorrect. My agreed rate is £[rate]/hour, but the payslip appears to use a different figure.\n\nCould you please double-check this for me? Thank you for your help.${sign}`;
    case "overtime":
      return `Hello payroll team,\n\nI worked some overtime during the pay period [dates] but I can't see it on my latest payslip. Could you please check if it has been included, and let me know how overtime is paid?\n\nThank you very much.${sign}`;
    case "holiday":
      return `Hello payroll team,\n\nI had a quick question about my holiday pay. Could you let me know how many holiday hours I have accrued so far this year, and how holiday pay is calculated for my role?\n\nThank you for your help.${sign}`;
    case "deduction":
      return `Hello payroll team,\n\nI noticed a deduction on my latest payslip that I don't fully understand. Could you please explain what it is for, and confirm it is correct?\n\nThank you for taking the time to look into this.${sign}`;
    case "missing-payslip":
      return `Hello payroll team,\n\nI haven't received my payslip for the pay period ending [date]. Could you please send it across when you have a moment?\n\nThank you very much.${sign}`;
  }
}

export function PayrollQueryModal({ onClose, initial = "missing-hours" }: { onClose: () => void; initial?: QueryIssue }) {
  const [issue, setIssue] = useState<QueryIssue>(initial);
  const [copied, setCopied] = useState(false);
  const msg = messageFor(issue);

  const copy = async () => {
    try { await navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <Modal title="Payroll query helper" onClose={onClose}>
      <p className="text-[13px] text-ink-soft mb-3">Pick an issue. We'll draft a polite message you can copy and send.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ISSUES.map((i) => (
          <button
            key={i.id}
            onClick={() => setIssue(i.id)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold ring-1 transition ${issue === i.id ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border text-ink"}`}
          >
            {i.label}
          </button>
        ))}
      </div>
      <textarea readOnly className="w-full rounded-2xl bg-card p-4 ring-1 ring-border text-[13px] leading-relaxed h-72" value={msg} />
      <Btn className="w-full mt-3" onClick={copy}>
        {copied ? <><Check className="size-4" /> Copied to clipboard</> : <><Copy className="size-4" /> Copy message</>}
      </Btn>
      <p className="mt-3 text-[11px] text-ink-soft">Replace anything in [brackets] with your details before sending.</p>
    </Modal>
  );
}

// ---------------- SAVE ----------------

const RULES: { id: SaveRule; label: string; desc: string; calc: (gross: number, net: number, shiftCount: number) => number }[] = [
  { id: "shift-1", label: "£1 per shift", desc: "Tiny and easy. Adds up quietly.", calc: (_g, _n, c) => c * 1 },
  { id: "shift-5", label: "£5 per shift", desc: "A small bite from each shift.", calc: (_g, _n, c) => c * 5 },
  { id: "percent-3", label: "3% of take-home", desc: "Scales with what you earn.", calc: (_g, n) => n * 0.03 },
];

export function SaveScreen() {
  const rule = useStore((s) => s.saveRule);
  const saved = useStore((s) => s.savedTotal);
  const shifts = useStore((s) => s.shifts);
  const week = weeklyTotals(shifts);
  const ded = estimateDeductions(week.gross);
  const active = RULES.find((r) => r.id === rule)!;

  const weekly = active.calc(week.gross, ded.net, week.count);
  const monthly = weekly * 4.33;
  const yearly = weekly * 52;

  const goal = 1000; // emergency fund
  const pct = Math.min(100, Math.round((saved / goal) * 100));

  return (
    <div className="pb-[120px]">
      <AppHeader title="Save" subtitle="Small moves from every shift" />

      <section className="mx-5 mt-5">
        <div className="rounded-[28px] bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">Saved so far</div>
          <div className="mt-2 font-display text-[52px] font-extrabold tracking-tight tabular-nums leading-none">{gbp(saved)}</div>
          <div className="mt-3 text-[13px] opacity-90">Emergency fund · {pct}% of {gbp(goal, { decimals: 0 })}</div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      <section className="mx-5 mt-5">
        <h2 className="text-[13px] font-bold text-ink-soft uppercase tracking-wider mb-2">Pick a saving rule</h2>
        <div className="space-y-2">
          {RULES.map((r) => {
            const active = rule === r.id;
            return (
              <button key={r.id} onClick={() => setSaveRule(r.id)} className={`w-full flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 text-left transition ${active ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold">{r.label}</div>
                  <div className={`text-[12px] ${active ? "opacity-90" : "text-ink-soft"}`}>{r.desc}</div>
                </div>
                {active ? <Check className="size-5" /> : <ChevronRight className="size-5 opacity-50" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-5 mt-5 grid grid-cols-3 gap-2">
        <Stat3 k="Weekly" v={gbp(weekly)} />
        <Stat3 k="Monthly" v={gbp(monthly)} />
        <Stat3 k="Yearly" v={gbp(yearly)} />
      </section>

      <section className="mx-5 mt-4">
        <Btn className="w-full" variant="ink" onClick={() => { addToSavings(weekly); toast.success(`${gbp(weekly)} moved to savings`, { description: "Small moves, real progress." }); }}>
          <PiggyBank className="size-4" /> Move {gbp(weekly)} to savings
        </Btn>
        <p className="mt-2 text-[11px] text-ink-soft text-center">Moves the amount in PayFlow only. We never touch your bank account.</p>
      </section>

      <Compliance />
    </div>
  );
}

function Stat3({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">{k}</div>
      <div className="mt-1 font-display text-[15px] font-extrabold tabular-nums">{v}</div>
    </div>
  );
}

// ---------------- LIFE ----------------

export function LifeScreen() {
  const items = [
    { icon: Heart, title: "Wellbeing check-in", body: "How are you feeling after your last shift? Tap to log." },
    { icon: Calendar, title: "Free training", body: "Care worker CPD courses, free with your role." },
    { icon: ShieldCheck, title: "Your rights at work", body: "Plain-English guide to holiday, rest breaks and sick pay (UK)." },
    { icon: TrendingUp, title: "Money habits", body: "Tiny ideas, never pushy. Read in 2 minutes." },
  ];
  return (
    <div className="pb-[120px]">
      <AppHeader title="Life" subtitle="Real perks. Calm tools." />
      <section className="mx-5 mt-4 space-y-2">
        {items.map((i) => (
          <div key={i.title} className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><i.icon className="size-4" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold">{i.title}</div>
              <div className="text-[12px] text-ink-soft">{i.body}</div>
            </div>
            <ChevronRight className="size-4 text-ink-soft" />
          </div>
        ))}
      </section>
      <Compliance short />
    </div>
  );
}

// ---------------- COACH ----------------

const COACH_QUICK: string[] = [
  "How is my week going?",
  "How can I save without feeling it?",
  "How does PAYE work?",
  "What is National Insurance?",
  "Why is my take-home less than my gross?",
];

type CoachMsg = { role: "user" | "coach"; text: string };

export function CoachScreen() {
  const shifts = useStore((s) => s.shifts);
  const hourlyRate = useStore((s) => s.hourlyRateDefault);
  const payCycle = useStore((s) => s.payCycle);
  const week = weeklyTotals(shifts);
  const ded = estimateDeductions(week.gross);

  const [messages, setMessages] = useState<CoachMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const { askCoach } = await import("@/lib/payflow/coach.functions");
      const res = await askCoach({
        data: {
          question: q,
          context: {
            weekHours: week.hours,
            weekNet: ded.net,
            hourlyRate,
            payCycle,
          },
        },
      });
      setMessages((m) => [...m, { role: "coach", text: res.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "coach", text: "Couldn't reach Coach just now. Please try again.\n\nFlow Coach gives general information only — not financial, tax, legal or payroll advice." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-[120px]">
      <AppHeader title="Flow Coach" subtitle="Ask anything about your pay" />

      {/* Today's insight */}
      <section className="mx-5 mt-4">
        <div className="rounded-[24px] bg-primary p-5 text-primary-foreground">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="size-3" /> Today
          </div>
          <p className="mt-2.5 text-[14px] leading-relaxed font-medium">
            {week.count > 0
              ? `You've logged ${fmtHours(week.hours)} this week — on track for around ${gbp(ded.net)} take-home.`
              : `Log a shift and I'll start showing you a real take-home estimate.`}
          </p>
        </div>
      </section>

      {/* Conversation */}
      <section className="mx-5 mt-4 space-y-2">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border text-[13px] leading-relaxed text-ink-soft">
            Hi — I'm Flow Coach. Ask me anything about your pay, payslips or saving habits. I can't give financial advice, but I'll explain things in plain English.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-8 bg-primary text-primary-foreground"
                : "mr-2 bg-card ring-1 ring-border"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="mr-2 rounded-2xl bg-card px-4 py-3 ring-1 ring-border text-[13px] text-ink-soft">
            Thinking…
          </div>
        )}
      </section>

      {/* Composer */}
      <section className="mx-5 mt-3">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex items-end gap-2 rounded-2xl bg-card p-2 ring-1 ring-border"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            placeholder="Ask Flow Coach…"
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[14px] outline-none placeholder:text-ink-soft"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-ink px-3.5 py-2.5 text-[13px] font-bold text-sand disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </section>

      {/* Quick prompts */}
      <section className="mx-5 mt-3">
        <div className="flex flex-wrap gap-1.5">
          {COACH_QUICK.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={busy}
              className="rounded-full bg-card px-3 py-1.5 text-[12px] font-bold ring-1 ring-border hover:bg-sand-deep disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Before payday checklist */}
      <section className="mx-5 mt-5">
        <h2 className="text-[12px] font-bold text-ink-soft uppercase tracking-wider mb-2">Before payday — quick check</h2>
        <ul className="space-y-1.5">
          {[
            "All shifts this week are logged",
            "Hourly rate looks right on each shift",
            "Any overtime is recorded",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <div className="mt-0.5 grid size-5 place-items-center rounded-full bg-primary-soft text-primary"><Check className="size-3" strokeWidth={3} /></div>
              <span className="text-[13px]">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-5 mt-4 rounded-2xl bg-card p-3 ring-1 ring-border">
        <p className="text-[11px] leading-snug text-ink-soft">
          Flow Coach gives general information only — not financial, tax, legal or payroll advice.
        </p>
      </div>
    </div>
  );
}


// ---------------- Setup Wizard / Onboarding ----------------

const CYCLE_OPTIONS: { id: PayCycle; label: string; sub: string }[] = [
  { id: "weekly", label: "Weekly", sub: "Paid every week" },
  { id: "biweekly", label: "Every 2 weeks", sub: "Fortnightly pay" },
  { id: "monthly", label: "Monthly", sub: "Once a month" },
];

export function SetupWizard({
  onClose,
  onSkip,
  initial,
}: {
  onClose: () => void;
  onSkip?: () => void;
  initial?: { hourlyRate?: number; workplace?: string; payCycle?: PayCycle };
}) {
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState<number>(initial?.hourlyRate ?? 14.5);
  const [workplace, setWorkplace] = useState<string>(initial?.workplace ?? "");
  const [cycle, setCycle] = useState<PayCycle>(initial?.payCycle ?? "weekly");
  const [payday, setPayday] = useState<string>(() => computeNextPayday(initial?.payCycle ?? "weekly"));

  function next() { setStep((s) => Math.min(2, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }
  function finish() {
    applySetup({
      hourlyRate: Number.isFinite(rate) && rate > 0 ? rate : 14.5,
      workplace: workplace.trim() || "My workplace",
      payCycle: cycle,
      nextPayday: payday,
    });
    toast.success("All set — these are your numbers now.", { description: "You can edit anytime from Today." });
    onClose();
  }

  function chooseCycle(c: PayCycle) {
    setCycle(c);
    setPayday(computeNextPayday(c));
  }

  return (
    <div className="fixed inset-0 z-50 bg-sand flex flex-col">
      <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <button onClick={step === 0 ? onClose : back} className="text-[13px] font-bold text-ink-soft hover:text-ink">
          {step === 0 ? "Close" : "← Back"}
        </button>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((k) => (
            <span key={k} className={`h-1.5 rounded-full transition-all ${k === step ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>
        {onSkip ? (
          <button onClick={onSkip} className="text-[13px] font-bold text-ink-soft hover:text-ink">Skip</button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {step === 0 && (
          <div className="max-w-sm mx-auto">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Wallet className="size-6" /></div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">What's your hourly rate?</h1>
            <p className="mt-2 text-[14px] text-ink-soft">This is the headline rate before tax. You can change it any time.</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
              <span className="font-display text-3xl font-extrabold text-ink-soft">£</span>
              <input
                inputMode="decimal" type="number" min={0} step="0.01"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full bg-transparent font-display text-4xl font-extrabold tabular-nums outline-none"
              />
              <span className="text-sm font-bold text-ink-soft">/ hour</span>
            </div>
            <p className="mt-3 text-[12px] text-ink-soft">National Living Wage for 21+ is £12.21/hour (April 2025). PayFlow is guidance only.</p>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-sm mx-auto">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Calendar className="size-6" /></div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">When do you get paid?</h1>
            <p className="mt-2 text-[14px] text-ink-soft">We'll show a countdown to your next payday on Today.</p>
            <div className="mt-5 space-y-2">
              {CYCLE_OPTIONS.map((opt) => {
                const active = cycle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => chooseCycle(opt.id)}
                    className={`w-full flex items-center justify-between rounded-2xl p-4 ring-1 text-left transition ${active ? "bg-primary text-primary-foreground ring-transparent" : "bg-card ring-border"}`}
                  >
                    <div>
                      <div className="text-[14px] font-bold">{opt.label}</div>
                      <div className={`text-[12px] ${active ? "opacity-90" : "text-ink-soft"}`}>{opt.sub}</div>
                    </div>
                    {active && <Check className="size-5" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-5">
              <label className="block text-[12px] font-bold text-ink-soft mb-1.5">Next payday</label>
              <input type="date" value={payday} onChange={(e) => setPayday(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-sm mx-auto">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-6" /></div>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">Name your workplace</h1>
            <p className="mt-2 text-[14px] text-ink-soft">Optional. Helps your shift cards make sense at a glance.</p>
            <input
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              placeholder="e.g. Maple Care Home"
              maxLength={60}
              className={`${inputCls} mt-5`}
            />
            <p className="mt-3 text-[12px] text-ink-soft">You can add more workplaces later when you add a shift.</p>
          </div>
        )}
      </div>

      <div className="px-6 pt-3 pb-[max(env(safe-area-inset-bottom),1.5rem)] space-y-2">
        {step < 2 ? (
          <Btn className="w-full" onClick={next} disabled={step === 0 && (!rate || rate <= 0)}>
            Continue <ChevronRight className="size-4" />
          </Btn>
        ) : (
          <Btn className="w-full" onClick={finish}><Check className="size-4" /> All set — show my numbers</Btn>
        )}
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"welcome" | "setup">("welcome");

  if (mode === "setup") {
    return <SetupWizard onClose={onDone} onSkip={onDone} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-sand flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="grid size-16 place-items-center rounded-3xl bg-primary text-primary-foreground mb-6">
          <Sparkles className="size-7" />
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Welcome to PayFlow</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft max-w-sm">
          A worker-first app for hourly pay. Let's set you up in about 10 seconds — your rate, when you get paid, and where you work.
        </p>
      </div>
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] space-y-3">
        <Btn className="w-full" onClick={() => setMode("setup")}>Let's set you up <ChevronRight className="size-4" /></Btn>
        <button onClick={onDone} className="block w-full text-center text-[13px] font-bold text-ink-soft">
          Explore with sample data first
        </button>
        <p className="text-center text-[11px] text-ink-soft">Guidance only. PayFlow is not financial, tax or payroll advice.</p>
      </div>
    </div>
  );
}


// Profile placeholder (unused but kept for future)
export function ProfileScreen({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Profile" onClose={onClose}>
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><User className="size-5" /></div>
        <div><div className="font-bold">You</div><div className="text-[12px] text-ink-soft">PayFlow user</div></div>
      </div>
      <p className="mt-4 text-[13px] text-ink-soft">All your data is stored on this device. Clear it any time from your browser settings.</p>
    </Modal>
  );
}
