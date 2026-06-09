import { useSyncExternalStore } from "react";
import { hoursBetween, round2 } from "./calc";
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

export type SaveRule = "shift-1" | "shift-5" | "percent-3";

export type State = {
  onboarded: boolean;
  shifts: Shift[];
  live: LiveShift;
  saveRule: SaveRule;
  savedTotal: number;       // running savings balance
  hourlyRateDefault: number;
  workplaceDefault: string;
};

const KEY = "payflow.state.v2";

const SEED_SHIFTS: Shift[] = (() => {
  // Reconciled: 34h @ £14.50 = £493. Spread across week.
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const day = (offset: number) => { const d = new Date(today); d.setDate(d.getDate() + offset); return iso(d); };
  const dow = today.getDay(); // 0 Sun .. 6 Sat
  // Build last Mon, Tue, Thu, Sat shifts relative to today
  const mk = (label: string, offset: number, start: string, end: string, br: number): Shift => {
    const hours = hoursBetween(start, end, br);
    return {
      id: crypto.randomUUID(),
      workplace: label, date: day(offset),
      start, end, breakMins: br, hourlyRate: 14.5,
      hours: round2(hours), gross: round2(hours * 14.5),
    };
  };
  // Offsets so all are in current week (Mon=1..Sat=6)
  const off = (target: number) => target - dow; // negative = past, 0 today
  return [
    mk("Maple Care Home", off(1), "07:30", "16:00", 30),  // Mon 8h
    mk("Maple Care Home", off(2), "07:30", "16:00", 30),  // Tue 8h
    mk("Riverside Lodge", off(4), "07:00", "19:30", 30),  // Thu 12h
    mk("Maple Care Home", off(6), "07:30", "13:30", 0),   // Sat 6h
  ];
})();

const DEFAULT: State = {
  onboarded: false,
  shifts: SEED_SHIFTS,
  live: { active: false, startedAt: 0, workplace: "Maple Care Home", hourlyRate: 14.5, breakMs: 0, pausedAt: null },
  saveRule: "shift-5",
  savedTotal: 312.4,
  hourlyRateDefault: 14.5,
  workplaceDefault: "Maple Care Home",
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
    date: startD.toISOString().slice(0, 10),
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
}

export function addShift(input: Omit<Shift, "id" | "hours" | "gross">) {
  const hours = round2(hoursBetween(input.start, input.end, input.breakMins));
  const gross = round2(hours * input.hourlyRate);
  const shift: Shift = { ...input, id: crypto.randomUUID(), hours, gross };
  store.set((s) => ({ ...s, shifts: [shift, ...s.shifts] }));
  return shift;
}

export function deleteShift(id: string) {
  store.set((s) => ({ ...s, shifts: s.shifts.filter((x) => x.id !== id) }));
}

export function setSaveRule(rule: SaveRule) {
  store.set((s) => ({ ...s, saveRule: rule }));
}

export function addToSavings(amount: number) {
  store.set((s) => ({ ...s, savedTotal: round2(s.savedTotal + amount) }));
}

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
