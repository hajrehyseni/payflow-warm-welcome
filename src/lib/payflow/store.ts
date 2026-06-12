import { useSyncExternalStore } from "react";
import { hoursBetween, round2, localISODate } from "./calc";
import { supabase } from "@/integrations/supabase/client";

let cloudUserId: string | null = null;

export type Shift = {
  id: string;
  workplace: string;
  date: string;        // YYYY-MM-DD
  start: string;       // HH:MM
  end: string;         // HH:MM
  breakMins: number;
  hourlyRate: number;
  notes?: string;
  hours: number;       // computed
  gross: number;       // computed
};

export type LiveShift = {
  active: boolean;
  startedAt: number;      // epoch ms
  workplace: string;
  hourlyRate: number;
  breakMs: number;        // accumulated paused ms
  pausedAt: number | null; // epoch ms when paused (break)
};

export type SaveRule = "shift-1" | "shift-5" | "percent-3" | "roundup-5" | "roundup-10";
export type PayCycle = "weekly" | "biweekly" | "monthly";

export type PayCheck = {
  id: string;
  createdAt: number;          // epoch ms
  periodStart: string;        // YYYY-MM-DD
  periodEnd: string;          // YYYY-MM-DD
  actualNet: number;          // what payslip shows
  actualHours: number;        // hours your payslip shows
  expectedNet: number;        // PayFlow estimate at time of check
  expectedHours: number;      // PayFlow tracked hours
  gapNet: number;             // expectedNet - actualNet (positive = short)
  gapHours: number;           // expectedHours - actualHours
  looksRight: boolean;        // true if within tolerance
};

export type State = {
  onboarded: boolean;
  shifts: Shift[];
  live: LiveShift;
  saveRule: SaveRule;
  savedTotal: number;       // running savings balance
  hourlyRateDefault: number;
  workplaceDefault: string;
  payCycle: PayCycle;
  nextPayday: string;        // YYYY-MM-DD
  usingSampleData: boolean;  // true when seeded with demo data
  pendingJoinCode?: string;  // captured from /join before sign-in
  payChecks: PayCheck[];
  recapDismissedWeek?: string;  // ISO date of Monday of the week most recently dismissed
  savePaused?: boolean;         // pause the active save rule
};

const KEY = "payflow.state.v2";

const SEED_SHIFTS: Shift[] = (() => {
  // Reconciled: 34h @ £14.50 = £493. Spread across week.
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const day = (offset: number) => { const d = new Date(today); d.setDate(d.getDate() + offset); return iso(d); };
  const dow = today.getDay();
  const mk = (label: string, offset: number, start: string, end: string, br: number): Shift => {
    const hours = hoursBetween(start, end, br);
    return {
      id: crypto.randomUUID(),
      workplace: label, date: day(offset),
      start, end, breakMins: br, hourlyRate: 14.5,
      hours: round2(hours), gross: round2(hours * 14.5),
    };
  };
  const off = (target: number) => target - dow;
  return [
    mk("Maple Care Home", off(1), "07:30", "16:00", 30),
    mk("Maple Care Home", off(2), "07:30", "16:00", 30),
    mk("Riverside Lodge", off(4), "07:00", "19:30", 30),
    mk("Maple Care Home", off(6), "07:30", "13:30", 0),
  ];
})();

function defaultNextFriday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const DEFAULT: State = {
  onboarded: false,
  shifts: SEED_SHIFTS,
  live: { active: false, startedAt: 0, workplace: "Maple Care Home", hourlyRate: 14.5, breakMs: 0, pausedAt: null },
  saveRule: "shift-5",
  savedTotal: 312.4,
  hourlyRateDefault: 14.5,
  workplaceDefault: "Maple Care Home",
  payCycle: "weekly",
  nextPayday: defaultNextFriday(),
  usingSampleData: true,
  payChecks: [],

};

function load(): State {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed, live: { ...DEFAULT.live, ...(parsed.live || {}) } };
  } catch { return DEFAULT; }
}

let state: State = typeof window !== "undefined" ? load() : DEFAULT;
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { listeners.forEach((l) => l()); }

export const store = {
  get: () => state,
  set(updater: (s: State) => State) {
    state = updater(state);
    persist();
    emit();
  },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  reset() { state = { ...DEFAULT }; persist(); emit(); },
};

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => sel(store.get()),
    () => sel(DEFAULT),
  );
}

// ---------- actions ----------
export function setOnboarded() { store.set((s) => ({ ...s, onboarded: true })); }

export function computeNextPayday(cycle: PayCycle, anchor: Date = new Date()): string {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  if (cycle === "weekly") {
    // Next Friday
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
  } else if (cycle === "biweekly") {
    d.setDate(d.getDate() + 14);
  } else {
    // Monthly: last working day of next month, approximated as last day of month
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // last day of current (post-increment) month — actually last day of THIS month
    // Move to last day of next month from original anchor:
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 2, 0);
    return last.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

export function applySetup(input: { hourlyRate: number; workplace: string; payCycle: PayCycle; nextPayday: string }) {
  store.set((s) => ({
    ...s,
    onboarded: true,
    hourlyRateDefault: input.hourlyRate,
    workplaceDefault: input.workplace,
    payCycle: input.payCycle,
    nextPayday: input.nextPayday,
    // Wipe demo data on first real setup
    shifts: [],
    savedTotal: 0,
    usingSampleData: false,
    live: { ...s.live, workplace: input.workplace, hourlyRate: input.hourlyRate },
  }));
}

export function setPendingJoinCode(code: string | undefined) {
  store.set((s) => ({ ...s, pendingJoinCode: code }));
}


export function startShift(workplace?: string, hourlyRate?: number) {
  store.set((s) => ({
    ...s,
    live: {
      active: true,
      startedAt: Date.now(),
      workplace: workplace || s.workplaceDefault,
      hourlyRate: hourlyRate ?? s.hourlyRateDefault,
      breakMs: 0,
      pausedAt: null,
    },
  }));
}

export function toggleBreak() {
  store.set((s) => {
    if (!s.live.active) return s;
    if (s.live.pausedAt) {
      // resume
      const breakMs = s.live.breakMs + (Date.now() - s.live.pausedAt);
      return { ...s, live: { ...s.live, pausedAt: null, breakMs } };
    }
    return { ...s, live: { ...s.live, pausedAt: Date.now() } };
  });
}

export function endShift() {
  const s = store.get();
  if (!s.live.active) return;
  const now = Date.now();
  const breakMs = s.live.breakMs + (s.live.pausedAt ? (now - s.live.pausedAt) : 0);
  const workedMs = (now - s.live.startedAt) - breakMs;
  const hours = round2(Math.max(0, workedMs) / 3600000);
  if (hours < 0.02) {
    store.set((st) => ({ ...st, live: { ...DEFAULT.live, workplace: st.workplaceDefault, hourlyRate: st.hourlyRateDefault } }));
    return;
  }
  const startD = new Date(s.live.startedAt);
  const endD = new Date(now);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const shift: Shift = {
    id: crypto.randomUUID(),
    workplace: s.live.workplace,
    date: localISODate(startD),
    start: fmt(startD),
    end: fmt(endD),
    breakMins: Math.round(breakMs / 60000),
    hourlyRate: s.live.hourlyRate,
    hours,
    gross: round2(hours * s.live.hourlyRate),
  };
  store.set((st) => ({
    ...st,
    shifts: [shift, ...st.shifts],
    live: { ...DEFAULT.live, workplace: st.workplaceDefault, hourlyRate: st.hourlyRateDefault },
  }));
  void cloudInsertShift(shift);
}

export function addShift(input: Omit<Shift, "id" | "hours" | "gross">) {
  const hours = round2(hoursBetween(input.start, input.end, input.breakMins));
  const gross = round2(hours * input.hourlyRate);
  const shift: Shift = { ...input, id: crypto.randomUUID(), hours, gross };
  store.set((s) => ({ ...s, shifts: [shift, ...s.shifts] }));
  void cloudInsertShift(shift);
  return shift;
}

export function deleteShift(id: string) {
  store.set((s) => ({ ...s, shifts: s.shifts.filter((x) => x.id !== id) }));
  if (cloudUserId) void supabase.from("shifts").delete().eq("id", id).eq("user_id", cloudUserId);
}

/** Re-insert a previously deleted shift, preserving id. Used for Undo. */
export function restoreShift(shift: Shift) {
  store.set((s) => ({ ...s, shifts: [shift, ...s.shifts.filter((x) => x.id !== shift.id)] }));
  void cloudInsertShift(shift);
}

/** Edit an existing shift in place; recomputes hours + gross from inputs. */
export function editShift(id: string, patch: Partial<Omit<Shift, "id" | "hours" | "gross">>) {
  store.set((s) => ({
    ...s,
    shifts: s.shifts.map((x) => {
      if (x.id !== id) return x;
      const merged = { ...x, ...patch };
      const hours = round2(hoursBetween(merged.start, merged.end, merged.breakMins));
      const gross = round2(hours * merged.hourlyRate);
      return { ...merged, hours, gross };
    }),
  }));
  if (cloudUserId) {
    const next = store.get().shifts.find((x) => x.id === id);
    if (next) {
      void supabase.from("shifts").update({
        workplace: next.workplace,
        shift_date: next.date,
        start_time: next.start + ":00",
        end_time: next.end + ":00",
        break_minutes: next.breakMins,
        hourly_rate: next.hourlyRate,
        hours: next.hours,
        gross_pay: next.gross,
        notes: next.notes ?? null,
      }).eq("id", id).eq("user_id", cloudUserId);
    }
  }
}

export function setSaveRule(rule: SaveRule) {
  store.set((s) => ({ ...s, saveRule: rule }));
  void cloudUpsertSavings();
}

export function toggleSavePaused() {
  store.set((s) => ({ ...s, savePaused: !s.savePaused }));
}

export function addToSavings(amount: number) {
  store.set((s) => ({ ...s, savedTotal: round2(Math.max(0, s.savedTotal + amount)) }));
  void cloudUpsertSavings();
}

export function withdrawFromSavings(amount: number) {
  store.set((s) => ({ ...s, savedTotal: round2(Math.max(0, s.savedTotal - amount)) }));
  void cloudUpsertSavings();
}

/** Partial settings update from the Settings screen. */
export function updateSettings(patch: Partial<Pick<State, "hourlyRateDefault" | "workplaceDefault" | "payCycle" | "nextPayday">>) {
  store.set((s) => ({
    ...s,
    ...patch,
    live: {
      ...s.live,
      workplace: patch.workplaceDefault ?? s.live.workplace,
      hourlyRate: patch.hourlyRateDefault ?? s.live.hourlyRate,
    },
  }));
}

// ---------- pay checks (local-only) ----------
export function addPayCheck(input: Omit<PayCheck, "id" | "createdAt">) {
  const pc: PayCheck = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  store.set((s) => ({ ...s, payChecks: [pc, ...s.payChecks].slice(0, 24) }));
  return pc;
}

export function dismissWeeklyRecap(weekMondayISO: string) {
  store.set((s) => ({ ...s, recapDismissedWeek: weekMondayISO }));
}

// ---------- cloud sync ----------
async function cloudInsertShift(shift: Shift) {
  if (!cloudUserId) return;
  await supabase.from("shifts").insert({
    id: shift.id,
    user_id: cloudUserId,
    workplace: shift.workplace,
    shift_date: shift.date,
    start_time: shift.start + ":00",
    end_time: shift.end + ":00",
    break_minutes: shift.breakMins,
    hourly_rate: shift.hourlyRate,
    hours: shift.hours,
    gross_pay: shift.gross,
    notes: shift.notes ?? null,
  });
}

async function cloudUpsertSavings() {
  if (!cloudUserId) return;
  const s = store.get();
  const amount = s.saveRule === "shift-1" ? 1 : s.saveRule === "shift-5" ? 5 : 3;
  await supabase.from("savings_rules").upsert({
    user_id: cloudUserId,
    rule_type: s.saveRule,
    amount,
    saved_total: s.savedTotal,
  }, { onConflict: "user_id" });
}

/** Hydrate the store from Supabase for a signed-in user. */
export async function hydrateFromCloud(userId: string) {
  cloudUserId = userId;
  const { data: rows } = await supabase
    .from("shifts")
    .select("id, workplace, shift_date, start_time, end_time, break_minutes, hourly_rate, hours, gross_pay, notes")
    .eq("user_id", userId)
    .order("shift_date", { ascending: false });

  const { data: sav } = await supabase
    .from("savings_rules")
    .select("rule_type, saved_total")
    .eq("user_id", userId)
    .maybeSingle();

  const localSeedFlag = `payflow.seeded.${userId}`;
  const seeded = typeof window !== "undefined" && localStorage.getItem(localSeedFlag);

  if (rows && rows.length > 0) {
    const shifts: Shift[] = rows.map((r) => ({
      id: r.id as string,
      workplace: r.workplace as string,
      date: r.shift_date as string,
      start: (r.start_time as string).slice(0, 5),
      end: (r.end_time as string).slice(0, 5),
      breakMins: r.break_minutes as number,
      hourlyRate: Number(r.hourly_rate),
      hours: Number(r.hours),
      gross: Number(r.gross_pay),
      notes: (r.notes as string | null) ?? undefined,
    }));
    store.set((s) => ({
      ...s,
      shifts,
      saveRule: (sav?.rule_type as SaveRule) ?? s.saveRule,
      savedTotal: sav?.saved_total != null ? Number(sav.saved_total) : s.savedTotal,
    }));
  } else if (!seeded) {
    // Brand-new account: seed Amina-style demo shifts to the cloud so screens aren't empty.
    const seed = store.get().shifts;
    for (const sh of seed) await cloudInsertShift(sh);
    if (typeof window !== "undefined") localStorage.setItem(localSeedFlag, "1");
  } else {
    store.set((s) => ({ ...s, shifts: [] }));
  }
}

export function clearCloudUser() { cloudUserId = null; }


// ---------- derived ----------
export function liveElapsedMs(live: LiveShift, now = Date.now()) {
  if (!live.active) return 0;
  const breakMs = live.breakMs + (live.pausedAt ? (now - live.pausedAt) : 0);
  return Math.max(0, (now - live.startedAt) - breakMs);
}

export function liveEarnings(live: LiveShift, now = Date.now()) {
  const ms = liveElapsedMs(live, now);
  return (ms / 3600000) * live.hourlyRate;
}

export function weekRange(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(d); monday.setDate(d.getDate() + diff); monday.setHours(0,0,0,0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
  return { monday, sunday };
}

export function thisWeekShifts(shifts: Shift[]) {
  const { monday, sunday } = weekRange();
  return shifts.filter((s) => {
    const d = new Date(s.date + "T00:00:00");
    return d >= monday && d <= sunday;
  });
}

export function weeklyTotals(shifts: Shift[]) {
  const ws = thisWeekShifts(shifts);
  const hours = round2(ws.reduce((a, x) => a + x.hours, 0));
  const gross = round2(ws.reduce((a, x) => a + x.gross, 0));
  return { hours, gross, count: ws.length };
}
