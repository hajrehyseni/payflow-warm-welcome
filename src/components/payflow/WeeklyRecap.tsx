import { useMemo } from "react";
import { Sparkles, X, Flame, Wallet, Clock, PiggyBank } from "lucide-react";
import { useStore, dismissWeeklyRecap } from "@/lib/payflow/store";
import { estimateDeductions, gbp, fmtHours } from "@/lib/payflow/calc";

function weekKey(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}
function lastWeekRange() {
  const now = new Date();
  const thisMon = new Date(weekKey(now) + "T00:00:00");
  const lastMon = new Date(thisMon); lastMon.setDate(thisMon.getDate() - 7);
  const lastSun = new Date(thisMon); lastSun.setDate(thisMon.getDate() - 1);
  return { lastMon, lastSun, lastMonISO: lastMon.toISOString().slice(0, 10) };
}

function computeStreak(shifts: { date: string }[]) {
  if (!shifts.length) return 0;
  const set = new Set(shifts.map((s) => s.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date(today);
  if (!set.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(iso(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

const WARM_LINES = [
  "Real work, real progress. You showed up.",
  "Every hour you logged is a step toward your goal.",
  "Small moves, week after week — that's how a safety net starts.",
  "You're building something quietly solid. Keep going.",
];

/** Returns the recap if it should be shown, else null. */
export function useWeeklyRecap() {
  const shifts = useStore((s) => s.shifts);
  const saved = useStore((s) => s.savedTotal);
  const dismissed = useStore((s) => s.recapDismissedWeek);

  return useMemo(() => {
    const { lastMon, lastSun, lastMonISO } = lastWeekRange();
    if (dismissed === lastMonISO) return null;
    const inLast = shifts.filter((s) => {
      const d = new Date(s.date + "T00:00:00");
      return d >= lastMon && d <= lastSun;
    });
    if (inLast.length === 0) return null;
    const hours = +inLast.reduce((a, x) => a + x.hours, 0).toFixed(2);
    const gross = +inLast.reduce((a, x) => a + x.gross, 0).toFixed(2);
    const ded = estimateDeductions(gross);
    const streak = computeStreak(shifts);
    const line = WARM_LINES[Math.floor(new Date(lastMonISO).getTime() / 86400000) % WARM_LINES.length];
    return { weekISO: lastMonISO, hours, net: ded.net, saved, streak, line, count: inLast.length };
  }, [shifts, saved, dismissed]);
}

export function WeeklyRecap({ data, onClose }: {
  data: { weekISO: string; hours: number; net: number; saved: number; streak: number; line: string; count: number };
  onClose: () => void;
}) {
  function close() { dismissWeeklyRecap(data.weekISO); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-sand rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-sand/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between border-b border-border/60">
          <h2 className="font-display text-xl font-extrabold">Your week</h2>
          <button onClick={close} className="grid size-9 place-items-center rounded-full bg-card ring-1 ring-border"><X className="size-4" /></button>
        </div>

        <div className="p-5">
          <div className="rounded-[24px] bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3" /> Last week
            </div>
            <div className="mt-3 font-display text-[44px] font-extrabold tabular-nums leading-none">{gbp(data.net)}</div>
            <div className="mt-1 text-sm opacity-90">estimated take-home from {data.count} shift{data.count === 1 ? "" : "s"}</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile icon={Clock} k="Hours" v={fmtHours(data.hours)} />
            <Tile icon={PiggyBank} k="Saved" v={gbp(data.saved)} />
            <Tile icon={Flame} k="Streak" v={`${data.streak}d`} />
          </div>

          <div className="mt-4 rounded-2xl bg-accent-soft p-4 ring-1 ring-accent/20">
            <p className="text-[14px] font-medium text-ink leading-relaxed">
              <Sparkles className="inline size-4 -mt-0.5 mr-1 text-accent" />
              {data.line}
            </p>
          </div>

          <button onClick={close} className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-ink text-sand py-3.5 font-bold">
            Ready for next week
          </button>
          <p className="mt-3 text-[11px] text-ink-soft text-center">Estimate only — your actual payslip may differ.</p>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, k, v }: { icon: any; k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
        <Icon className="size-3" /> {k}
      </div>
      <div className="mt-1 font-display text-[16px] font-extrabold tabular-nums">{v}</div>
    </div>
  );
}
