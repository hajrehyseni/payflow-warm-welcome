import { ShieldCheck, Users, Clock, MessageSquareOff, FileCheck2, TrendingUp } from "lucide-react";

export function BusinessROIPanel({ active, hours, queriesAvoided, engagementPct }: {
  active: number;
  hours: number;
  queriesAvoided: number;
  engagementPct: number;
}) {
  // "Pay checks run this period" — strictly aggregate estimate.
  // Conservative: assume each active worker runs ~1 pay check per pay period.
  const payChecksRun = Math.max(0, Math.round(active * 1));

  return (
    <section className="rounded-[28px] bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-[0_14px_40px_-18px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="size-3" /> Why PayFlow pays for itself
          </div>
          <h2 className="mt-3 font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            ~{queriesAvoided} payroll questions saved this month
          </h2>
          <p className="mt-1 text-sm opacity-90">
            Workers self-serve their pay confidence — fewer payslip emails, less back-and-forth.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Stat icon={MessageSquareOff} k="Queries avoided" v={`~${queriesAvoided}`} />
        <Stat icon={Clock} k="Team hours tracked" v={hours.toLocaleString()} />
        <Stat icon={Users} k="Workers active" v={`${engagementPct}%`} />
        <Stat icon={FileCheck2} k="Pay checks run" v={`~${payChecksRun}`} />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        <p className="text-[11px] leading-snug opacity-90">
          Aggregate only. PayFlow never shows an individual worker's pay, shifts or pay-check results to managers.
        </p>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, k, v }: { icon: any; k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-85">
        <Icon className="size-3" /> {k}
      </div>
      <div className="mt-1.5 font-display text-2xl font-extrabold tabular-nums">{v}</div>
    </div>
  );
}
