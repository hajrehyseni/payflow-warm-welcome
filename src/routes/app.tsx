import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Wallet, PiggyBank, Sparkles, Heart } from "lucide-react";
import { TodayScreen, PayScreen, SaveScreen, LifeScreen, CoachScreen, Onboarding } from "@/components/app/screens";
import { useStore, setOnboarded } from "@/lib/payflow/store";

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
  const onboarded = useStore((s) => s.onboarded);
  const [tab, setTab] = useState<Tab>("today");
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  if (!ready) return null;

  if (!onboarded) {
    return <Onboarding onDone={setOnboarded} />;
  }

  return (
    <div className="min-h-screen bg-sand">
      <main className="mx-auto max-w-md">
        {tab === "today" && <TodayScreen goToTab={(t) => setTab(t as Tab)} />}
        {tab === "pay" && <PayScreen />}
        {tab === "save" && <SaveScreen />}
        {tab === "life" && <LifeScreen />}
        {tab === "coach" && <CoachScreen />}
      </main>

      {/* Fixed bottom nav */}
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
