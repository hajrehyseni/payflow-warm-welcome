// Pure helpers for tiered worker pricing — used on client and server.
export const MIN_MONTHLY_GBP = 99;
export const PILOT_DAYS = 90;

export type Tier = { priceId: "payflow_biz_tier1" | "payflow_biz_tier2" | "payflow_biz_tier3"; perWorker: number; label: string };

export function tierFor(workers: number): Tier {
  if (workers >= 1000) return { priceId: "payflow_biz_tier3", perWorker: 1.5, label: "1,000+" };
  if (workers >= 250) return { priceId: "payflow_biz_tier2", perWorker: 2.0, label: "250–999" };
  return { priceId: "payflow_biz_tier1", perWorker: 2.5, label: "1–249" };
}

// Quantity that, multiplied by the per-worker rate, hits at least the £99/mo minimum.
export function billableQuantity(workers: number): number {
  const t = tierFor(workers);
  const minQty = Math.ceil(MIN_MONTHLY_GBP / t.perWorker);
  return Math.max(workers, minQty, 1);
}

export function estimateMonthlyGBP(workers: number): number {
  const t = tierFor(workers);
  return Math.max(MIN_MONTHLY_GBP, Math.round(workers * t.perWorker));
}

export function pilotDaysLeft(pilotStartedAt: string | Date | null | undefined): number {
  if (!pilotStartedAt) return PILOT_DAYS;
  const start = new Date(pilotStartedAt).getTime();
  const elapsed = (Date.now() - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(PILOT_DAYS - elapsed));
}
