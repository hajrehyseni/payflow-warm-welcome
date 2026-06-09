import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Users, Clock, MessageSquareOff, TrendingUp, Copy, LogOut, ShieldCheck, Building2, CreditCard, Rocket, ExternalLink } from "lucide-react";
import { useAuth, signOut, ensureInitialised, refreshProfile } from "@/lib/payflow/auth";
import { supabase } from "@/integrations/supabase/client";
import { tierFor, billableQuantity, estimateMonthlyGBP, pilotDaysLeft } from "@/lib/payflow/pricing";
import { createBusinessPortal } from "@/lib/payflow/billing.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { BusinessCheckoutModal, PaymentTestModeBanner } from "@/components/payflow/BusinessCheckoutModal";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: "Business dashboard — PayFlow" }] }),
  validateSearch: (s: Record<string, unknown>): { checkout?: string } => ({
    checkout: typeof s.checkout === "string" ? s.checkout : undefined,
  }),
  component: BusinessPage,
});

function makeJoinCode() {
  const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = ""; for (let i = 0; i < 6; i++) out += a[Math.floor(Math.random() * a.length)];
  return out;
}

type Aggregates = { active_workers: number; total_hours: number; engagement_pct: number; queries_avoided: number };
type OrgRow = {
  id: string; name: string; join_code: string;
  plan: string | null; subscription_status: string | null;
  current_period_end: string | null; pilot_started_at: string | null;
  stripe_customer_id: string | null;
};

function BusinessPage() {
  const user = useAuth();
  const nav = useNavigate();
  const search = useSearch({ from: "/business" });
  const [ready, setReady] = useState(false);
  const [agg, setAgg] = useState<Aggregates | null>(null);
  const [org, setOrg] = useState<OrgRow | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void ensureInitialised().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) { nav({ to: "/login" }); return; }
    if (user.role !== "business") { nav({ to: "/app" }); return; }
    void bootstrap();
  }, [ready, user?.id]);

  useEffect(() => {
    if (search.checkout === "success") {
      // Refresh org after a short delay so the webhook can land
      const t = setTimeout(() => void bootstrap(), 1500);
      return () => clearTimeout(t);
    }
  }, [search.checkout]);

  async function bootstrap() {
    if (!user) return;
    let { data: orgRow } = await supabase
      .from("organisations")
      .select("id, name, join_code, plan, subscription_status, current_period_end, pilot_started_at, stripe_customer_id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!orgRow) {
      const { data: s } = await supabase.auth.getSession();
      const company = (s.session?.user.user_metadata as any)?.company ?? "Your workplace";
      const code = makeJoinCode();
      const ins = await supabase
        .from("organisations")
        .insert({ name: company, join_code: code, owner_id: user.id })
        .select("id, name, join_code, plan, subscription_status, current_period_end, pilot_started_at, stripe_customer_id")
        .single();
      if (ins.data) {
        orgRow = ins.data;
        await supabase.from("org_members").insert({ org_id: orgRow.id, user_id: user.id, role: "owner" });
        await refreshProfile();
      }
    }
    if (orgRow) {
      setOrg(orgRow as OrgRow);
      const { data: a } = await supabase.rpc("get_org_aggregates", { _org_id: orgRow.id });
      if (a && Array.isArray(a) && a[0]) setAgg(a[0] as Aggregates);
    }
  }

  async function handlePortal() {
    setPortalBusy(true); setError(null);
    try {
      const result = await createBusinessPortal({
        data: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/business` },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open billing portal.");
    } finally {
      setPortalBusy(false);
    }
  }

  if (!ready || !user || user.role !== "business") return null;

  const m = agg ?? { active_workers: 0, total_hours: 0, engagement_pct: 0, queries_avoided: 0 };
  const active = Number(m.active_workers);
  const tier = tierFor(active);
  const monthly = estimateMonthlyGBP(active);
  const qty = billableQuantity(active);

  const status = org?.subscription_status;
  const isActive = status === "active" || status === "trialing";
  const isPastDue = status === "past_due";
  const daysLeft = pilotDaysLeft(org?.pilot_started_at);
  const onPilot = !isActive && daysLeft > 0;

  const joinLink = typeof window !== "undefined" && user.joinCode
    ? `${window.location.origin}/join?code=${user.joinCode}`
    : "";

  function copy() {
    if (typeof navigator === "undefined" || !joinLink) return;
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  }

  async function handleSignOut() { await signOut(); nav({ to: "/" }); }

  const planBadge = isActive
    ? { text: "Active subscription", className: "bg-primary-soft text-primary" }
    : isPastDue
      ? { text: "Past due — update billing", className: "bg-red-100 text-red-700" }
      : onPilot
        ? { text: `Pilot · ${daysLeft} days left`, className: "bg-accent-soft text-accent" }
        : { text: "Pilot ended — start subscription", className: "bg-amber-100 text-amber-800" };

  const nextInvoice = isActive && org?.current_period_end
    ? new Date(org.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : onPilot
      ? `After ${daysLeft}-day pilot`
      : "—";

  return (
    <div className="min-h-screen bg-sand text-ink">
      <PaymentTestModeBanner />
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
              <Building2 className="size-3.5" /> {user.company ?? "Your workplace"}
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight">Workforce overview</h1>
            <p className="mt-1 text-ink-soft">Last 30 days · aggregate only · no individual pay shown.</p>
          </div>
          <div className={`rounded-full px-3 py-1.5 text-xs font-bold ${planBadge.className}`}>{planBadge.text}</div>
        </div>

        {search.checkout === "success" && (
          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-primary-soft p-4 ring-1 ring-primary/20">
            <Rocket className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm text-primary"><strong>You're subscribed.</strong> Thanks for backing your team — the new plan is now active.</p>
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric icon={Users} label="Active workers" value={String(active)} hint="Tracked a shift in the last 30 days" />
          <Metric icon={Clock} label="Hours tracked" value={Number(m.total_hours).toLocaleString()} hint="Across the team" />
          <Metric icon={MessageSquareOff} label="Queries avoided" value={`~${m.queries_avoided}`} hint="Estimated payroll queries prevented" />
          <Metric icon={TrendingUp} label="Engagement" value={`${m.engagement_pct}%`} hint="Active vs total members" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-3xl bg-ink p-6 text-sand ring-1 ring-ink">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Invite your workers</div>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Share your join code</h2>
            <p className="mt-1 text-sm text-sand/70">Workers join free in under 2 minutes. No card, no IT setup.</p>

            <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Code</div>
                <div className="font-display text-2xl font-extrabold tracking-[0.25em]">{user.joinCode ?? "——"}</div>
              </div>
              <div className="rounded-2xl bg-sand/10 px-4 py-3 ring-1 ring-sand/15 truncate">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sand/60">Link</div>
                <div className="truncate text-sm">{joinLink || "—"}</div>
              </div>
              <button onClick={copy} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-bold text-accent-foreground hover:scale-[1.02] transition-transform">
                <Copy className="size-4" /> {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <CreditCard className="size-3.5" /> Billing
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold">£{monthly}</span>
              <span className="text-sm text-ink-soft">/ month</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{active} active × £{tier.perWorker.toFixed(2)} · £99 minimum</p>

            <div className="mt-4 space-y-2 text-sm">
              <Row k="Billable seats" v={`${qty} (min ${Math.ceil(99 / tier.perWorker)})`} />
              <Row k="Tier" v={`${tier.label} workers`} />
              <Row k="Next invoice" v={nextInvoice} />
            </div>

            {isActive || isPastDue ? (
              <button
                onClick={handlePortal}
                disabled={portalBusy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-bold text-sand hover:bg-primary disabled:opacity-60"
              >
                {portalBusy ? "Opening…" : <>Manage billing <ExternalLink className="size-3.5" /></>}
              </button>
            ) : (
              <button
                onClick={() => setCheckoutOpen(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:scale-[1.01] transition-transform"
              >
                <Rocket className="size-4" /> Start subscription
              </button>
            )}
            <Link to="/pricing" className="mt-2 block text-center text-xs font-semibold text-ink-soft hover:text-ink">
              See pricing details →
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-2 rounded-2xl bg-card p-4 ring-1 ring-border">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Aggregate only. PayFlow never shows an individual worker's pay, shifts or savings to managers — those are private to the worker. PayFlow gives estimates only and is not financial, tax, payroll, banking or legal advice.
          </p>
        </div>

        {org?.id && (
          <p className="mt-4 text-[10px] text-ink-soft/70">org · {org.id.slice(0, 8)}</p>
        )}
      </main>

      {checkoutOpen && <BusinessCheckoutModal onClose={() => setCheckoutOpen(false)} />}
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
