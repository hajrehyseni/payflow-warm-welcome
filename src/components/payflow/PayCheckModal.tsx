import { useMemo, useState } from "react";
import { X, Check, AlertCircle, ShieldCheck, MessageSquare, History, ChevronRight } from "lucide-react";
import { useStore, addPayCheck, weekRange, type PayCheck } from "@/lib/payflow/store";
import { estimateDeductions, gbp, fmtHours } from "@/lib/payflow/calc";
import { PayrollQueryModal } from "@/components/app/screens";

// Tolerance: if absolute net gap < £3 or < 1.5% AND hour gap < 0.25h, looks right
function evaluate(actualNet: number, actualHours: number, expectedNet: number, expectedHours: number) {
  const gapNet = +(expectedNet - actualNet).toFixed(2);
  const gapHours = +(expectedHours - actualHours).toFixed(2);
  const pct = expectedNet > 0 ? Math.abs(gapNet) / expectedNet : 0;
  const looksRight = Math.abs(gapNet) < 3 || (pct < 0.015 && Math.abs(gapHours) < 0.25);
  return { gapNet, gapHours, looksRight };
}

export function PayCheckModal({ onClose }: { onClose: () => void }) {
  const shifts = useStore((s) => s.shifts);
  const hourlyRate = useStore((s) => s.hourlyRateDefault);
  const payChecks = useStore((s) => s.payChecks);

  // Default period: the current pay week (Mon–Sun) so figures match the Pay screen.
  const { monday, sunday } = weekRange();
  const weekStartISO = monday.toISOString().slice(0, 10);
  const weekEndISO = sunday.toISOString().slice(0, 10);

  const [periodStart, setPeriodStart] = useState(weekStartISO);
  const [periodEnd, setPeriodEnd] = useState(weekEndISO);
  const [actualNet, setActualNet] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(0);
  const [result, setResult] = useState<PayCheck | null>(null);
  const [queryOpen, setQueryOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const expected = useMemo(() => {
    const inPeriod = shifts.filter((s) => s.date >= periodStart && s.date <= periodEnd);
    const hours = inPeriod.reduce((a, x) => a + x.hours, 0);
    const gross = inPeriod.reduce((a, x) => a + x.gross, 0);
    const ded = estimateDeductions(gross);
    return { hours: +hours.toFixed(2), gross, net: ded.net };
  }, [shifts, periodStart, periodEnd]);

  // Both figures must be sensible before comparing, AND we need something tracked to compare against.
  const hasTracked = expected.hours > 0;
  const bothEntered = actualNet > 0 && actualHours > 0;
  // Friendly warning for obviously unrealistic entries (still allowed to proceed).
  const looksLow = (actualNet > 0 && actualNet < 10) || (actualHours > 0 && actualHours < 1);

  function run() {
    const ev = evaluate(actualNet, actualHours, expected.net, expected.hours);
    const pc = addPayCheck({
      periodStart, periodEnd,
      actualNet: +actualNet, actualHours: +actualHours,
      expectedNet: expected.net, expectedHours: expected.hours,
      gapNet: ev.gapNet, gapHours: ev.gapHours,
      looksRight: ev.looksRight,
    });
    setResult(pc);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-sand rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-sand/95 backdrop-blur px-5 pt-4 pb-3 flex items-center justify-between border-b border-border/60">
          <h2 className="font-display text-xl font-extrabold">Check my pay</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-card ring-1 ring-border"><X className="size-4" /></button>
        </div>

        <div className="p-5">
          {!result && !showHistory && (
            <>
              <p className="text-[14px] font-bold text-ink mb-1.5">Enter the figures shown on your payslip. PayFlow will compare them with the shifts you tracked.</p>
              <p className="text-[12px] text-ink-soft mb-4">PayFlow can't read your payslip automatically — you type in the figures, and we compare them with what you tracked.</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[12px] font-bold text-ink-soft mb-1.5">Period start</span>
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full rounded-2xl bg-card px-3 py-2.5 ring-1 ring-border text-[14px]" />
                  </label>
                  <label className="block">
                    <span className="block text-[12px] font-bold text-ink-soft mb-1.5">Period end</span>
                    <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full rounded-2xl bg-card px-3 py-2.5 ring-1 ring-border text-[14px]" />
                  </label>
                </div>

                {hasTracked ? (
                  <div className="rounded-2xl bg-primary-soft p-3 ring-1 ring-primary/15 text-[12px] text-primary">
                    <strong>You tracked:</strong> {fmtHours(expected.hours)} · estimate {gbp(expected.net)} take-home
                  </div>
                ) : (
                  <div className="rounded-2xl bg-card p-3 ring-1 ring-border text-[12px] text-ink-soft">
                    No shifts tracked in this period yet. Add your shifts first so PayFlow has something to compare.
                  </div>
                )}

                <label className="block">
                  <span className="block text-[12px] font-bold text-ink-soft mb-1.5">Take-home pay shown on your payslip (£)</span>
                  <input type="number" min={0} step="0.01" inputMode="decimal" placeholder="0.00" value={actualNet || ""} onChange={(e) => setActualNet(Number(e.target.value))} className="w-full rounded-2xl bg-card px-4 py-3 ring-1 ring-border text-[15px]" />
                </label>
                <label className="block">
                  <span className="block text-[12px] font-bold text-ink-soft mb-1.5">Paid hours shown on your payslip</span>
                  <input type="number" min={0} step="0.25" inputMode="decimal" placeholder="0" value={actualHours || ""} onChange={(e) => setActualHours(Number(e.target.value))} className="w-full rounded-2xl bg-card px-4 py-3 ring-1 ring-border text-[15px]" />
                </label>
              </div>

              {!bothEntered && (
                <p className="mt-3 text-[12px] text-ink-soft">
                  Add the take-home pay and paid hours from your payslip to compare.
                </p>
              )}

              {looksLow && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-accent-soft p-3 ring-1 ring-accent/20">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  <p className="text-[12px] leading-snug text-ink">
                    These figures look very low. Check you entered the full payslip amount and paid hours.
                  </p>
                </div>
              )}

              <button
                onClick={run}
                disabled={!bothEntered || !hasTracked}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3.5 font-bold shadow-[0_10px_24px_-14px_rgba(0,87,255,0.65)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <Check className="size-4" /> Compare with PayFlow
              </button>

              {payChecks.length > 0 && (
                <button onClick={() => setShowHistory(true)} className="mt-3 w-full inline-flex items-center justify-center gap-2 text-[12px] font-bold text-ink-soft hover:text-ink">
                  <History className="size-3.5" /> View past checks ({payChecks.length})
                </button>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-card p-3 ring-1 ring-border">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <p className="text-[11px] leading-snug text-ink-soft">
                  Estimate only — always check with your payroll team if something looks off. PayFlow doesn't access your payslip or your bank.
                </p>
              </div>
            </>
          )}

          {result && (
            <ResultView
              result={result}
              hourlyRate={hourlyRate}
              onQuery={() => setQueryOpen(true)}
              onClose={onClose}
              onAgain={() => { setResult(null); setActualNet(0); setActualHours(0); }}
            />
          )}

          {showHistory && (
            <HistoryView payChecks={payChecks} onBack={() => setShowHistory(false)} />
          )}
        </div>
      </div>

      {queryOpen && <PayrollQueryModal onClose={() => setQueryOpen(false)} initial="missing-hours" />}
    </div>
  );
}

function ResultView({ result, hourlyRate, onQuery, onClose, onAgain }: {
  result: PayCheck; hourlyRate: number; onQuery: () => void; onClose: () => void; onAgain: () => void;
}) {
  const { looksRight, gapNet, gapHours, actualHours, expectedHours, actualNet, expectedNet } = result;
  const ok = looksRight;
  const short = !ok && gapNet > 0;
  const over = !ok && gapNet < 0;
  const hoursDiff = +(expectedHours - actualHours).toFixed(2);
  const hourGapPay = +(Math.abs(hoursDiff) * hourlyRate).toFixed(2);
  const hoursOff = Math.abs(hoursDiff) >= 0.25;
  // Plain-English verdict a worker can grasp in a glance.
  const verdict = ok ? "Looks close" : hoursOff ? "Hours may be missing" : "Take-home looks different";

  return (
    <div>
      <div className={`rounded-[24px] p-5 ${ok ? "bg-money text-money-foreground" : short ? "bg-accent text-accent-foreground" : "bg-ink text-sand"}`}>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
          {ok ? <Check className="size-3" /> : <AlertCircle className="size-3" />} {verdict}
        </div>
        <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
          {ok
            ? "Your pay looks right"
            : short
              ? `Looks about ${gbp(Math.abs(gapNet))} lower than expected`
              : `Looks about ${gbp(Math.abs(gapNet))} higher than expected`}
        </h3>
        <p className="mt-2 text-[13px] opacity-90 leading-relaxed">
          {ok
            ? "Your payslip lines up with what you tracked. Nicely done logging every shift."
            : Math.abs(hoursDiff) >= 0.25
              ? `Your payslip shows ${fmtHours(actualHours)} but you tracked ${fmtHours(expectedHours)} — about ${gbp(hourGapPay)} difference at ${gbp(hourlyRate)}/hr.`
              : "Hours look similar, but the take-home figure is off — could be tax code, deductions or overtime rate."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border space-y-2 text-[13px]">
        <Row k="Payslip take-home" v={gbp(actualNet)} />
        <Row k="PayFlow estimate" v={gbp(expectedNet)} />
        <Row k="Payslip hours" v={fmtHours(actualHours)} />
        <Row k="Tracked hours" v={fmtHours(expectedHours)} />
      </div>

      {!ok && (
        <>
          <p className="mt-4 text-center text-[13px] font-bold text-ink">Ask payroll to check this.</p>
          <button onClick={onQuery} className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-ink text-sand py-3.5 font-bold">
            <MessageSquare className="size-4" /> Draft a polite payroll query
          </button>
        </>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={onAgain} className="rounded-2xl bg-card py-2.5 text-[13px] font-bold ring-1 ring-border">Check another</button>
        <button onClick={onClose} className="rounded-2xl bg-primary text-primary-foreground py-2.5 text-[13px] font-bold">Done</button>
      </div>

      <p className="mt-4 text-[11px] text-ink-soft text-center">
        Guidance only — always confirm anything unusual with your payroll team.
      </p>
    </div>
  );
}

function HistoryView({ payChecks, onBack }: { payChecks: PayCheck[]; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-[13px] font-bold text-ink-soft hover:text-ink">← Back</button>
      <h3 className="font-display text-lg font-extrabold mb-3">Past pay checks</h3>
      <ul className="space-y-2">
        {payChecks.map((p) => (
          <li key={p.id} className="rounded-2xl bg-card p-3.5 ring-1 ring-border">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink-soft">
                {p.periodStart} → {p.periodEnd}
              </span>
              <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${p.looksRight ? "bg-money-soft text-money" : "bg-accent-soft text-accent"}`}>
                {p.looksRight ? "Looked right" : `${p.gapNet > 0 ? "−" : "+"}${gbp(Math.abs(p.gapNet))}`}
              </span>
            </div>
            <div className="mt-1 text-[12px] text-ink-soft">
              Payslip {gbp(p.actualNet)} · estimate {gbp(p.expectedNet)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{k}</span>
      <span className="font-bold tabular-nums">{v}</span>
    </div>
  );
}
