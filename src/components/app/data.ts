export const USER = {
  name: "Amina",
  role: "Care Worker",
  hourly: 14.5,
  shiftStart: "07:30",
  shiftEnd: "13:30",
  worked: { hours: 5, minutes: 42 }, // current shift progress
  weeklyHours: 34,
  weeklyGross: 493.0,
  weeklyEstimatedNet: 398.02,
  savingsBalance: 312.4,
  savingsGoal: 600,
  savingsGoalName: "Eid trip home",
};

export type Tx = {
  id: string;
  label: string;
  meta: string;
  amount: number; // positive = earned
  type: "shift" | "tip" | "save" | "deduction";
  date: string;
};

export const RECENT: Tx[] = [
  { id: "1", label: "Shift · Maple Care Home", meta: "Today · ongoing", amount: 82.65, type: "shift", date: "Today" },
  { id: "2", label: "Round-up saved", meta: "Yesterday", amount: 2.4, type: "save", date: "Yesterday" },
  { id: "3", label: "Shift · Riverside Lodge", meta: "Thu · 12h 00m", amount: 174.0, type: "shift", date: "Thu" },
  { id: "4", label: "Tip — Mrs. Whitaker", meta: "Tue", amount: 10.0, type: "tip", date: "Tue" },
  { id: "5", label: "Shift · Maple Care Home", meta: "Tue · 8h 00m", amount: 116.0, type: "shift", date: "Tue" },
];

// Daily breakdown for the week — Mon 8h, Tue 8h, Thu 12h, Sat 6h (today) = 34h
export const WEEK = [
  { day: "Mon", hours: 8, earned: 116 },
  { day: "Tue", hours: 8, earned: 116 },
  { day: "Wed", hours: 0, earned: 0 },
  { day: "Thu", hours: 12, earned: 174 },
  { day: "Fri", hours: 0, earned: 0 },
  { day: "Sat", hours: 5.7, earned: 82.65, live: true },
  { day: "Sun", hours: 0, earned: 0, upcoming: true },
];

// Take-home breakdown estimate — reconciles: 493 − 50.25 − 20.08 − 24.65 = 398.02
export const TAKEHOME = {
  gross: 493.0,
  tax: 50.25,
  ni: 20.08,
  pension: 24.65,
  net: 398.02,
};

