export const USER = {
  name: "Amina",
  role: "Care Worker",
  hourly: 14.5,
  shiftStart: "07:30",
  shiftEnd: "15:30",
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
  { id: "3", label: "Shift · Maple Care Home", meta: "Yesterday · 8h 00m", amount: 116.0, type: "shift", date: "Yesterday" },
  { id: "4", label: "Tip — Mrs. Whitaker", meta: "Mon", amount: 10.0, type: "tip", date: "Mon" },
  { id: "5", label: "Shift · Riverside Lodge", meta: "Sun · 6h 30m", amount: 94.25, type: "shift", date: "Sun" },
];

// Daily breakdown for the week
export const WEEK = [
  { day: "Mon", hours: 8, earned: 116 },
  { day: "Tue", hours: 6.5, earned: 94.25 },
  { day: "Wed", hours: 0, earned: 0 },
  { day: "Thu", hours: 8, earned: 116 },
  { day: "Fri", hours: 5.7, earned: 82.65, live: true },
  { day: "Sat", hours: 0, earned: 0, upcoming: true },
  { day: "Sun", hours: 4, earned: 58, upcoming: true },
];

// Take-home breakdown estimate
export const TAKEHOME = {
  gross: 464.0,
  tax: 32.5,
  ni: 18.48,
  pension: 15.0,
  net: 398.02,
};
