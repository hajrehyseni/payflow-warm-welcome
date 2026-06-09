import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Wallet, PiggyBank, Sparkles, Heart, LogOut } from "lucide-react";
import { TodayScreen, PayScreen, SaveScreen, LifeScreen, CoachScreen, Onboarding } from "@/components/app/screens";
import { useStore } from "@/lib/payflow/store";
import { hydrateFromCloud, clearCloudUser } from "@/lib/payflow/store";
import { useAuth, signOut, ensureInitialised, updateProfile } from "@/lib/payflow/auth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "PayFlow — Know your pay before payday" },
      { name: "description", content: "Track your hours, estimate your take-home pay and save from every shift. Built for UK hourly workers." },
      { name: "viewport", content: "width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1" },
      { name: "theme-color", content: "#f5efe4" },
    ],
  }),
  component: AppShell,
});

type Tab = "today" | "pay" | "save" | "life" | "coach";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "pay", label: "Pay", icon: Wallet },
  { id: "save", label: "Save", icon: PiggyBank },
  { id: "life", label: "Life", icon: Heart },
  { id: "coach", label: "Coach", icon: Sparkles },
];

function AppShell() {
  const user = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const localOnboarded = useStore((s) => s.onboarded);

  useEffect(() => { void ensureInitialised().then(() => setReady(true)); }, []);

  // Hydrate from cloud once we know the user
  useEffect(() => {
    if (!ready) return;
    if (user) { void hydrateFromCloud(user.id).then(() => setHydrated(true)); }
    else { clearCloudUser(); setHydrated(true); }
  }, [ready, user?.id]);

  // Auth gate: signed-out visitors can still see the app in local-only mode,
  // but after init if not signed-in we send them to /login (Phase 2 requirement).
  useEffect(() => {
    if (ready && !user) {
      const t = setTimeout(() => { if (!auth_get()) nav({ to: "/login" }); }, 50);
      return () => clearTimeout(t);
    }
  }, [ready, user, nav]);

  if (!ready || !hydrated) return null;
  if (!user) return null;

  const onboarded = user.onboardingComplete || localOnboarded;
  if (!onboarded) {
    return <Onboarding onDone={() => { void updateProfile({ onboarding_complete: true }); }} />;
  }

  async function handleSignOut() {
    await signOut();
    clearCloudUser();
    nav({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-sand">
      <button
        onClick={handleSignOut}
        className="fixed right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-bold text-ink ring-1 ring-border backdrop-blur hover:bg-sand-deep"
        aria-label="Sign out"
      >
        <LogOut className="size-3.5" /> Sign out
      </button>
      <main className="mx-auto max-w-md">
        {tab === "today" && <TodayScreen goToTab={(t) => setTab(t as Tab)} />}
        {tab === "pay" && <PayScreen />}
        {tab === "save" && <SaveScreen />}
        {tab === "life" && <LifeScreen />}
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
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors ${active ? "text-primary" : "text-ink-soft"}`}
                aria-label={t.label}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.6 : 2} />
                <span className={`text-[10.5px] ${active ? "font-extrabold" : "font-semibold"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// internal helper to avoid React state staleness in the redirect timeout
import { auth as _auth } from "@/lib/payflow/auth";
function auth_get() { return _auth.get(); }
