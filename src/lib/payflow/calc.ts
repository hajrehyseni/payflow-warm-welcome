// UK tax / NI / pension estimates (weekly, 2024/25 thresholds, simplified)
// Personal Allowance £12,570/yr ≈ £241.73/week
// Basic rate 20% above PA up to higher-rate threshold (ignored — out of scope for hourly workers)
// NI Primary Threshold £242/week, 8% on earnings above
// Pension: auto-enrolment 5% employee contribution

const WEEKLY_PERSONAL_ALLOWANCE = 12570 / 52; // 241.73
const NI_THRESHOLD = 242;
const TAX_RATE = 0.20;
const NI_RATE = 0.08;
const PENSION_RATE = 0.05;

export function estimateDeductions(grossWeekly: number) {
  const taxable = Math.max(0, grossWeekly - WEEKLY_PERSONAL_ALLOWANCE);
  const tax = round2(taxable * TAX_RATE);
  const niable = Math.max(0, grossWeekly - NI_THRESHOLD);
  const ni = round2(niable * NI_RATE);
  const pension = round2(grossWeekly * PENSION_RATE);
  const net = round2(grossWeekly - tax - ni - pension);
  return { gross: round2(grossWeekly), tax, ni, pension, net };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Local calendar date as YYYY-MM-DD. Unlike Date.toISOString().slice(0,10),
// this does not shift to UTC — so a shift ending just after midnight in UK
// summer time (BST) is filed under the correct local day and pay week.
export function localISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function gbp(n: number, opts: { decimals?: number } = {}) {
  const d = opts.decimals ?? 2;
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtHours(h: number) {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function fmtClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${hh}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export function hoursBetween(start: string, end: string, breakMins: number) {
  // start, end like "07:30"; if end < start, assume next day
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  mins -= breakMins;
  return Math.max(0, mins) / 60;
}

export function nextFriday(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (5 - day + 7) % 7 || 7; // next Friday (not today)
  d.setDate(d.getDate() + diff);
  return d;
}

export function daysUntil(date: Date, from = new Date()) {
  const ms = date.setHours(0,0,0,0) - new Date(from).setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}
