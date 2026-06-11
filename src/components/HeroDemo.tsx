import { useEffect, useState, useRef } from "react";
import { Play, Pause, Clock, TrendingUp, Wallet, PiggyBank, Sparkles, Check } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";

const STEPS = [
  { key: "clock", label: "Clock in", icon: Clock },
  { key: "earn", label: "Watch your pay grow", icon: TrendingUp },
  { key: "takehome", label: "Know your take-home", icon: Wallet },
  { key: "save", label: "Save from every shift", icon: PiggyBank },
  { key: "build", label: "Build a better life", icon: Sparkles },
] as const;

const STEP_MS = 3400;

export function HeroDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!playing) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playing, step]);

  const current = STEPS[step];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-full overflow-x-hidden">
      <PhoneFrame className="w-[min(58vw,232px)] sm:w-[min(70vw,280px)] md:w-[320px] lg:w-[360px]">
        <div className="relative flex h-full w-full flex-col bg-gradient-to-b from-sand to-sand-deep">
          {/* status bar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 text-[10px] font-semibold text-ink-soft">
            <span>9:41</span>
            <span className="font-display font-extrabold text-ink">PayFlow</span>
            <span>●●●</span>
          </div>

          {/* step content */}
          <div className="relative flex-1 px-5">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`absolute inset-0 px-5 transition-all duration-500 ${
                  i === step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                {i === 0 && <StepClockIn active={step === 0} />}
                {i === 1 && <StepEarnings active={step === 1} />}
                {i === 2 && <StepTakeHome active={step === 2} />}
                {i === 3 && <StepSave active={step === 3} />}
                {i === 4 && <StepBuild active={step === 4} />}
              </div>
            ))}
          </div>

          {/* caption */}
          <div className="px-6 pb-6 pt-3">
            <div className="rounded-2xl bg-ink/95 px-4 py-2.5 text-center backdrop-blur">
              <div className="flex items-center justify-center gap-2 text-sand">
                <current.icon className="size-3.5" />
                <span className="text-[13px] font-bold tracking-tight">{current.label}</span>
              </div>
            </div>
          </div>

          {/* progress bar at bottom of phone */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-ink/10">
            <div
              key={`${step}-${playing}`}
              className="h-full bg-primary"
              style={{
                animation: playing ? `heroStepBar ${STEP_MS}ms linear forwards` : "none",
                width: playing ? "0%" : "100%",
              }}
            />
          </div>
        </div>
      </PhoneFrame>

      {/* controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause demo" : "Play demo"}
          className="grid size-9 place-items-center rounded-full bg-card ring-1 ring-border text-ink hover:bg-sand-deep transition-colors cursor-pointer"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Demo steps">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s.label}`}
              onClick={() => {
                setStep(i);
                setPlaying(false);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === step ? "w-6 bg-primary" : "w-2 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroStepBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes heroPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes heroTap {
          0% { transform: scale(0.4); opacity: 0; }
          40% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes heroRing {
          from { stroke-dashoffset: 283; }
          to { stroke-dashoffset: 70; }
        }
        @keyframes heroFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function StepClockIn({ active }: { active: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) { setT(0); return; }
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const hh = Math.floor(t / 3600).toString().padStart(2, "0");
  const mm = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
  const ss = (t % 60).toString().padStart(2, "0");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Today's shift</div>
      <div className="font-display text-4xl font-extrabold tracking-tight text-ink tabular-nums">
        {hh}:{mm}:{ss}
      </div>
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full bg-primary/40"
          style={{ animation: active ? "heroTap 1.5s ease-out infinite" : "none" }}
        />
        <button
          type="button"
          className="relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg"
          style={{ animation: active ? "heroPulse 1.8s ease-in-out infinite" : "none" }}
        >
          Clock in
        </button>
      </div>
      <div className="text-xs text-ink-soft">£14.50 / hour</div>
    </div>
  );
}

function StepEarnings({ active }: { active: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    const start = Date.now();
    const target = 32.40;
    const dur = 2800;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setVal(target * (1 - Math.pow(1 - p, 3)));
    }, 40);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Earning now</div>
      <div className="font-display text-5xl font-extrabold tracking-tight text-ink tabular-nums">
        £{val.toFixed(2)}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
        <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
        Live · 2h 14m on shift
      </div>
      <div className="mt-2 w-full rounded-2xl bg-card p-3 ring-1 ring-border">
        <div className="flex items-center justify-between text-[11px] text-ink-soft">
          <span>This week</span>
          <span className="font-bold text-ink tabular-nums">£{(val * 15).toFixed(0)} of £493</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${Math.min(100, (val * 15) / 4.93)}%` }} />
        </div>
      </div>
    </div>
  );
}

function StepTakeHome({ active: _active }: { active: boolean }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">This week's pay</div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[10px] text-ink-soft">Gross</div>
          <div className="font-display text-xl font-extrabold text-ink tabular-nums">£493.00</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-primary font-bold">Take-home</div>
          <div className="font-display text-2xl font-extrabold text-primary tabular-nums">£398.12</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "PAYE income tax", val: "−£50.25" },
          { label: "National Insurance", val: "−£20.08" },
          { label: "Pension (5%)", val: "−£24.65" },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 ring-1 ring-border text-[12px]">
            <span className="text-ink-soft">{r.label}</span>
            <span className="font-bold text-ink tabular-nums">{r.val}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-ink-soft leading-snug">Plain-English estimate. Your payslip is the final word.</div>
    </div>
  );
}

function StepSave({ active }: { active: boolean }) {
  const radius = 45;
  const circ = 2 * Math.PI * radius;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Savings goal · Safety net</div>
      <div className="relative grid size-36 place-items-center">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-ink/10" />
          <circle
            cx="50" cy="50" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
            className="text-primary"
            stroke="currentColor"
            strokeDasharray={circ}
            style={{
              strokeDashoffset: active ? circ * 0.25 : circ,
              transition: "stroke-dashoffset 2.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-2xl font-extrabold text-ink tabular-nums">£186</div>
            <div className="text-[10px] text-ink-soft">of £250</div>
          </div>
        </div>
      </div>
      <div className="w-full rounded-2xl bg-primary-soft px-3 py-2 text-center">
        <div className="text-[11px] font-bold text-primary">Rule: £5 from every shift</div>
      </div>
    </div>
  );
}

function StepBuild({ active }: { active: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative grid size-16 place-items-center rounded-full bg-accent-soft">
        <Sparkles className="size-7 text-accent" style={{ animation: active ? "heroPulse 1.6s ease-in-out infinite" : "none" }} />
      </div>
      <div className="text-center">
        <div className="font-display text-2xl font-extrabold leading-tight text-ink">You're building.</div>
        <div className="mt-1 text-[13px] text-ink-soft leading-snug">3 weeks running — that's how<br />a safety net starts.</div>
      </div>
      <div className="flex items-center gap-1.5">
        {[1,2,3,4,5,6,7].map((d, i) => (
          <div key={d} className={`grid size-6 place-items-center rounded-full text-[9px] font-bold ${i < 5 ? "bg-primary text-primary-foreground" : "bg-ink/10 text-ink-soft"}`}>
            {i < 5 ? <Check className="size-3" /> : d}
          </div>
        ))}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">5-day streak</div>
    </div>
  );
}
