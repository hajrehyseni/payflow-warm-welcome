import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Users, Clock, MessageSquareOff, TrendingUp, Copy, LogOut, ShieldCheck, Building2, CreditCard } from "lucide-react";
import { useAuth, signOut } from "@/lib/payflow/auth";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: "Business dashboard — PayFlow" }] }),
  component: BusinessPage,
});

function BusinessPage() {
  const user = useAuth();
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (ready && (!user || user.role !== "business")) nav({ to: "/login" });
  }, [ready, user, nav]);

  if (!ready || !user || user.role !== "business") return null;

  return <Dashboard />;
}

function Dashboard() {
  const user = useAuth()!;
  const nav = useNavigate();
  const [copied, setCopied] = useState(false);

  // Mock metrics seeded deterministically from join code
  const m = useMemo(() => {
    const seed = (user.joinCode || "ABC123").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = (n: number, base: number) => base + (seed % n);
    const activeWorkers = rnd(40, 38);
    const totalHours = activeWorkers * rnd(20, 110);
    const queriesAvoided = Math.round(activeWorkers * 0.6);
    const engagement = 64 + (seed % 22);
    return { activeWorkers, totalHours, queriesAvoided, engagement };
  }, [user.joinCode]);

  // Billing calc per pricing page
  const pricePerWorker = m.activeWorkers >= 1000 ? 1.5 : m.activeWorkers >= 250 ? 2.0 : 2.5;
  const billing = Math.max(99, Math.round(m.activeWorkers * pricePerWorker));

  const joinLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?code=${user.joinCode}`
    : `/signup?code=${user.joinCode}`;

  function copy() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleSignOut() { signOut(); nav({ to: "/" }); }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-sand/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
            <span className="ml-2 hidden rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent md:inline">Business</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="hidden text-sm font-semibold text-ink-soft hover:text-ink md:inline">Pricing</Link>
            <button onClick={handleSignOut} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-ink ring-1 ring-border hover:bg-sand-deep">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-border">
              <Building2 className="size-3.5" /> {user.company}
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight">Workforce overview</h1>
            <p className="mt-1 text-ink-soft">This month · aggregate only · no individual pay shown.</p>
          </div>
          <div className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">90-day pilot · active</div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric icon={Users} label="Active workers" value={m.activeWorkers.toString()} hint="Workers using PayFlow this month" />
          <Metric icon={Clock} label="Hours tracked" value={m.totalHours.toLocaleString()} hint="Across the team" />
          <Metric icon={MessageSquareOff} label="Queries avoided" value={`~${m.queriesAvoided}`} hint="Estimated payroll queries prevented" />
          <Metric icon={TrendingUp} label="Engagement" value={`${m.engagement}%`} hint="Workers active weekly" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Invite card */}
          <div className="md:col-span-2 rounded-3xl bg-ink p-6 text-sand ring-1 ring-ink">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Invite your workers</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Share your join code</h2>
            <p className="mt-1 text-sm text-sand/70">Workers join free in under 2 minutes. No card, no IT setup.</p>

            <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Code</div>
                <div className="font-display text-2xl font-extrabold tracking-[0.25em]">{user.joinCode}</div>
              </div>
              <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15 truncate">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Link</div>
                <div className="truncate text-sm">{joinLink}</div>
              </div>
              <button onClick={copy} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-bold text-accent-foreground hover:scale-[1.02] transition-transform">
                <Copy className="size-4" /> {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>

          {/* Billing */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <CreditCard className="size-3.5" /> Billing
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold">£{billing}</span>
              <span className="text-sm text-ink-soft">/ month</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{m.activeWorkers} active × £{pricePerWorker.toFixed(2)} · £99 minimum</p>

            <div className="mt-4 space-y-2 text-sm">
              <Row k="Seats used" v={`${m.activeWorkers} active`} />
              <Row k="Plan" v="Business · pilot" />
              <Row k="Next invoice" v="—" />
            </div>
            <Link to="/pricing" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-bold text-sand hover:bg-primary">
              View pricing
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-2 rounded-2xl bg-card p-4 ring-1 ring-border">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Aggregate only. PayFlow never shows an individual worker's pay, savings, or personal decisions to managers. Workers own their data. PayFlow gives estimates only and is not financial, tax, payroll, banking or legal advice.
          </p>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-center gap-2 text-ink-soft">
        <div className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-4" /></div>
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold">{value}</div>
      <p className="mt-1 text-[12px] text-ink-soft">{hint}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border/60 pb-1.5 last:border-0"><span className="text-ink-soft">{k}</span><span className="font-bold">{v}</span></div>;
}
