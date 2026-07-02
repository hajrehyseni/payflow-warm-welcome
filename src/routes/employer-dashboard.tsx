import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Users, ShieldCheck, AlertCircle, Clock, MessageSquare, TrendingDown, Heart, LayoutDashboard, Briefcase, FileText, Settings } from "lucide-react";

export const Route = createFileRoute("/employer-dashboard")({
  head: () => ({
    meta: [
      { title: "Employer Dashboard Preview — PayFlow" },
      { name: "description", content: "Preview of the PayFlow employer dashboard: compliance alerts, payroll query trends, and worker satisfaction metrics." },
      { property: "og:title", content: "Employer Dashboard Preview — PayFlow" },
      { property: "og:description", content: "Preview of the PayFlow employer dashboard: compliance alerts, payroll query trends, and worker satisfaction metrics." },
    ],
  }),
  component: EmployerDashboardPreview,
});

function EmployerDashboardPreview() {
  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* Preview banner */}
      <div className="bg-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary">
        This is a preview. Book a demo to see the full dashboard.
      </div>

      {/* Header */}
      <header className="border-b border-border/60 bg-sand/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <a
            href="mailto:info@londonra.com?subject=Book a PayFlow demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Book a demo <ArrowRight className="size-3.5" />
          </a>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-6xl">
        {/* Dark sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between bg-ink p-6 text-sand md:flex">
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={Users} label="Workers" />
            <SidebarItem icon={ShieldCheck} label="Compliance" />
            <SidebarItem icon={MessageSquare} label="Queries" />
            <SidebarItem icon={FileText} label="Reports" />
            <SidebarItem icon={Briefcase} label="Organisation" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>
          <div className="rounded-2xl bg-sand/5 p-4 ring-1 ring-sand/10">
            <p className="text-xs font-semibold text-sand/80">Pilot plan</p>
            <p className="mt-1 text-[11px] text-sand/60">14 days free · No card required</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Employer Dashboard Preview</h1>
            <span className="text-xs font-semibold text-ink-soft">Last updated: today, 09:00</span>
          </div>

          {/* Metric cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Users} label="Active Workers" value="247" change="+12 this month" />
            <MetricCard icon={ShieldCheck} label="Payroll Accuracy" value="99.2%" change="+0.4% vs last month" />
            <MetricCard icon={MessageSquare} label="Open Queries" value="12" change="-5 this week" />
            <MetricCard icon={Clock} label="Avg Resolution Time" value="1.4 days" change="-0.3 days" />
          </div>

          {/* Compliance alerts */}
          <section className="mt-6 rounded-3xl bg-card p-5 sm:p-6 ring-1 ring-border">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-accent" />
              <h2 className="font-display text-lg font-extrabold">Compliance Alerts</h2>
            </div>
            <ul className="mt-4 space-y-3">
              <AlertItem
                level="high"
                title="Tax code mismatch detected"
                body="3 workers have payslip tax codes that differ from HMRC notices. Review before next payroll run."
              />
              <AlertItem
                level="high"
                title="NMW underpayment risk flagged"
                body="One shift pattern suggests a worker may drop below National Minimum Wage after deductions."
              />
              <AlertItem
                level="medium"
                title="Overtime pattern anomaly"
                body="Warehouse team shows 18% more unclaimed overtime than usual. Check rota allocation."
              />
            </ul>
          </section>

          {/* Trends + satisfaction */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl bg-card p-5 sm:p-6 ring-1 ring-border">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold">Payroll Query Trends</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                  <TrendingDown className="size-3" /> Down 34%
                </span>
              </div>
              <div className="mt-5 h-48 w-full">
                <svg viewBox="0 0 300 140" className="h-full w-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 35, 70, 105, 140].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <path
                    d="M0,120 C40,110 60,125 90,95 C120,65 140,85 170,55 C200,25 230,45 260,20 C280,5 300,15 300,15 L300,140 L0,140 Z"
                    className="fill-primary/10"
                  />
                  {/* Line */}
                  <path
                    d="M0,120 C40,110 60,125 90,95 C120,65 140,85 170,55 C200,25 230,45 260,20 C280,5 300,15 300,15"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Points */}
                  {[
                    [0, 120],
                    [90, 95],
                    [170, 55],
                    [260, 20],
                    [300, 15],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" className="fill-primary" />
                  ))}
                </svg>
              </div>
              <div className="mt-3 flex justify-between text-xs text-ink-soft">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </section>

            <section className="rounded-3xl bg-card p-5 sm:p-6 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-primary" />
                <h2 className="font-display text-lg font-extrabold">Worker Satisfaction</h2>
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-6xl font-extrabold text-primary">4.6</span>
                <span className="text-xl font-semibold text-ink-soft">/ 5</span>
              </div>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`h-2 flex-1 rounded-full ${star <= 4 ? "bg-primary" : "bg-primary/20"} ${star === 5 ? "bg-gradient-to-r from-primary to-primary/20" : ""}`}
                  />
                ))}
              </div>
              <p className="mt-5 text-sm text-ink-soft">
                Based on anonymous feedback from 189 workers this month. Pay clarity and fast query resolution are the top drivers.
              </p>
              <div className="mt-5 rounded-2xl bg-primary-soft p-4">
                <p className="text-sm font-semibold text-primary">Top theme</p>
                <p className="text-sm text-ink-soft">"I finally understand my payslip."</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-primary/20 text-primary"
          : "text-sand/70 hover:bg-sand/5 hover:text-sand"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
      <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-4" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs font-semibold text-primary">{change}</p>
    </div>
  );
}

function AlertItem({
  level,
  title,
  body,
}: {
  level: "high" | "medium" | "low";
  title: string;
  body: string;
}) {
  const levelStyles = {
    high: "bg-accent-soft text-accent",
    medium: "bg-primary/10 text-primary",
    low: "bg-ink/5 text-ink-soft",
  };
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-sand/60 p-4 ring-1 ring-border">
      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${level === "high" ? "bg-accent" : level === "medium" ? "bg-primary" : "bg-ink-soft"}`} />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-extrabold text-ink">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelStyles[level]}`}>
            {level}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
      </div>
    </li>
  );
}
