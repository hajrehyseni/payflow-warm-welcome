import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Wallet, PiggyBank, Sparkles, LogOut, CloudUpload } from "lucide-react";
import { TodayScreen, PayScreen, SaveScreen, CoachScreen, Onboarding } from "@/components/app/screens";
import { useStore, setOnboarded as setLocalOnboarded } from "@/lib/payflow/store";
import { daysUntil } from "@/lib/payflow/calc";
import { hydrateFromCloud, clearCloudUser } from "@/lib/payflow/store";
import { useAuth, signOut, ensureInitialised, updateProfile } from "@/lib/payflow/auth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "PayFlow — Know your pay before payday" },
      { name: "description", content: "Track your hours, estimate your take-home pay and save from every shift. Built for UK hourly workers." },
      { name: "viewport", content: "width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1" },
      { name: "theme-color", content: "#F2F7FF" },
    ],
  }),
  component: AppShell,
});

type Tab = "today" | "pay" | "save" | "coach";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "pay", label: "Pay", icon: Wallet },
  { id: "save", label: "Save", icon: PiggyBank },
  { id: "coach", label: "Coach", icon: Sparkles },
];

function AppSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground animate-pulse-dot">
        <Sparkles className="size-7" />
      </div>
      <span className="font-display text-sm font-bold text-ink-soft">PayFlow</span>
    </div>
  );
}

function AppShell() {
  const user = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const localOnboarded = useStore((s) => s.onboarded);
  const nextPayday = useStore((s) => s.nextPayday);
  const paydaySoon = (() => {
    try { return daysUntil(new Date(nextPayday + "T00:00:00")) <= 1; } catch { return false; }
  })();

  useEffect(() => { void ensureInitialised().then(() => setReady(true)); }, []);

  // Hydrate from cloud once we know the user; guests skip cloud and use local store.
  useEffect(() => {
    if (!ready) return;
    if (user) { void hydrateFromCloud(user.id).then(() => setHydrated(true)); }
    else { clearCloudUser(); setHydrated(true); }
  }, [ready, user?.id]);

  if (!ready || !hydrated) return <AppSplash />;

  // Guest-first: no login wall. Local onboarding flag is enough.
  const onboarded = (user?.onboardingComplete) || localOnboarded;
  if (!onboarded) {
    return <Onboarding onDone={() => {
      setLocalOnboarded();
      if (user) void updateProfile({ onboarding_complete: true });
    }} />;
  }

  async function handleSignOut() {
    await signOut();
    clearCloudUser();
    nav({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-sand">
      {user ? (
        <button
          onClick={handleSignOut}
          className="fixed right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-bold text-ink ring-1 ring-border backdrop-blur hover:bg-sand-deep"
          aria-label="Sign out"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      ) : (
        <Link
          to="/login"
          className="fixed right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground ring-1 ring-primary/30 shadow-[0_6px_18px_-8px_rgba(0,87,255,0.55)] backdrop-blur hover:opacity-95"
          aria-label="Save across devices"
        >
          <CloudUpload className="size-3.5" /> Save across devices
        </Link>
      )}
      <main className="mx-auto max-w-md">
        {tab === "today" && <TodayScreen goToTab={(t) => setTab(t as Tab)} />}
        {tab === "pay" && <PayScreen />}
        {tab === "save" && <SaveScreen />}
        {tab === "coach" && <CoachScreen />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-sand/95 backdrop-blur-xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <div className="flex items-stretch justify-between px-2 pt-1.5">
          {TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 mx-0.5 transition-all active:scale-[0.94] ${active ? "text-primary bg-primary-soft" : "text-ink-soft"}`}
                aria-label={t.label}
                aria-current={active ? "page" : undefined}
              >
                {active && <span className="absolute top-0 h-[3px] w-7 rounded-full bg-primary" />}
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={active ? 2.6 : 2} />
                  {t.id === "pay" && paydaySoon && !active && (
                    <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-sand" aria-label="Payday soon" />
                  )}
                </span>
                <span className={`text-[10.5px] ${active ? "font-extrabold" : "font-semibold"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
