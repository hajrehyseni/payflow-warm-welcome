import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Wallet, PiggyBank, Sparkles, Heart, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TodayScreen, PayScreen, SaveScreen, LifeScreen, CoachScreen, ProfileScreen, WelcomeCard } from "@/components/app/screens";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "PayFlow demo · See your shift earn in real time" },
      { name: "description", content: "Interactive PayFlow demo: live shift earnings, take-home, savings and Flow Coach." },
      { property: "og:title", content: "PayFlow demo · See your shift earn in real time" },
      { property: "og:description", content: "Interactive PayFlow demo for hourly workers." },
    ],
  }),
  component: AppDemo,
});

type Tab = "today" | "pay" | "save" | "life" | "coach";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "pay", label: "Pay", icon: Wallet },
  { id: "save", label: "Save", icon: PiggyBank },
  { id: "life", label: "Life", icon: Heart },
  { id: "coach", label: "Coach", icon: Sparkles },
];

function AppDemo() {
  const [tab, setTab] = useState<Tab>("today");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[800px] -translate-x-1/2 rounded-full bg-primary-soft/60 blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-accent-soft/60 blur-3xl opacity-30" />
      </div>

      {/* Lightweight chrome */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-primary transition-colors">
          <ChevronLeft className="size-4" /> Back to PayFlow
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-border">
          <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
          Live demo · all data illustrative
        </div>
      </header>

      <div className="grid gap-10 px-6 pb-16 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Left explainer (desktop) */}
        <aside className="hidden lg:block max-w-sm justify-self-end text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Try the loop</div>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink">
            Clock in. <br/>Watch it grow.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Earnings tick up in real time at Amina's £14.50/hr. Tap through Pay to see the take-home estimate, then Save for the gentle savings ring.
          </p>
        </aside>

        {/* Phone */}
        <PhoneFrame>
          <div className="relative h-full w-full">
            {tab === "today" && <TodayScreen goToTab={setTab} onProfileClick={() => setProfileOpen(true)} />}
            {tab === "pay" && <PayScreen onProfileClick={() => setProfileOpen(true)} />}
            {tab === "save" && <SaveScreen onProfileClick={() => setProfileOpen(true)} />}
            {tab === "life" && <LifeScreen onProfileClick={() => setProfileOpen(true)} />}
            {tab === "coach" && <CoachScreen onProfileClick={() => setProfileOpen(true)} />}

            {/* Profile overlay */}
            {profileOpen && <ProfileScreen onClose={() => setProfileOpen(false)} />}

            {/* Bottom tab bar */}
            <nav className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-1 rounded-full bg-card/95 p-1.5 ring-1 ring-border backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]">
              {TABS.map((t) => {
                const active = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 transition-all ${
                      active ? "bg-primary text-primary-foreground" : "text-ink-soft hover:text-ink"
                    }`}
                    aria-label={t.label}
                  >
                    <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 2} />
                    <span className="text-[9.5px] font-bold tracking-tight">{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </PhoneFrame>

        {/* Right explainer (desktop) */}
        <aside className="hidden lg:block max-w-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Magic loop</div>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink">
            See it. Save it. <br/>Live better.
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink">
            <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Clock in → live pay grows</li>
            <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Pay tab → understand take-home</li>
            <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Save tab → gentle, automatic</li>
            <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Life tab → small wins, real impact</li>
            <li className="flex gap-2"><span className="text-primary font-bold">5.</span> Coach → keeps you on track</li>
          </ul>
        </aside>

        {/* Mobile-only quick legend */}
        <div className="lg:hidden text-center text-xs text-ink-soft">
          Tap the bottom tabs to explore · all figures illustrative
        </div>
      </div>
    </div>
  );
}
