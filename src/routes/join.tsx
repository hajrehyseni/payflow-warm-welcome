import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ensureInitialised } from "@/lib/payflow/auth";
import { lookupOrgByCode } from "@/lib/payflow/join.functions";
import { setPendingJoinCode } from "@/lib/payflow/store";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join your workplace — PayFlow" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ code: (s.code as string) || "" }),
  component: JoinPage,
});

function JoinPage() {
  const { code: initialCode } = Route.useSearch();
  const user = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState((initialCode || "").toUpperCase());
  const [orgName, setOrgName] = useState<string | null>(null);
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "joining" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => { void ensureInitialised(); }, []);

  // Resolve code → company name (no sign-in required)
  useEffect(() => {
    const c = (initialCode || "").trim().toUpperCase();
    if (!c) return;
    setLookupErr(null);
    void lookupOrgByCode({ data: { code: c } })
      .then((r) => {
        if ("error" in r) setLookupErr(r.error);
        else setOrgName(r.name);
      })
      .catch(() => setLookupErr("Could not check this invite right now."));
  }, [initialCode]);

  async function joinAsSignedIn() {
    if (!code.trim()) return;
    setState("joining"); setMsg("");
    const { data, error } = await (supabase.rpc as any)("join_org_with_code", { _code: code.trim().toUpperCase() });
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      setState("error");
      setMsg("That code doesn't match a workplace. Double-check with your manager.");
      return;
    }
    setState("done"); setMsg((data[0] as { org_name: string }).org_name);
  }

  function enterAsGuest() {
    // Store code; it will be auto-claimed when they sign up later.
    setPendingJoinCode(code.trim().toUpperCase());
    nav({ to: "/app" });
  }

  // Warm landing when we have a resolved org and an initial code (deep link from invite)
  const warm = orgName && initialCode;

  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="border-b border-border/60 bg-sand/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 pt-12 pb-20">
        {state === "done" ? (
          <div className="rounded-3xl bg-card p-8 ring-1 ring-border text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">You're in.</h2>
            <p className="mt-2 text-sm text-ink-soft">Welcome to <span className="font-semibold text-ink">{msg}</span>. Your pay stays private.</p>
            <button onClick={() => nav({ to: "/app" })} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-sm font-bold text-sand">
              Open PayFlow <ArrowRight className="size-4" />
            </button>
          </div>
        ) : warm ? (
          <>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Heart className="size-3" /> You're invited
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight leading-tight">
              {orgName} invited you to PayFlow
            </h1>
            <p className="mt-2 text-ink-soft">Free for you, forever. Track your hours, see your take-home before payday, save gently from each shift.</p>

            <div className="mt-6 space-y-3">
              {user ? (
                <button
                  onClick={joinAsSignedIn}
                  disabled={state === "joining"}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary disabled:opacity-60"
                >
                  {state === "joining" ? "Joining…" : <>Join {orgName} <ArrowRight className="size-4" /></>}
                </button>
              ) : (
                <>
                  <button
                    onClick={enterAsGuest}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary"
                  >
                    Join {orgName} <ArrowRight className="size-4" />
                  </button>
                  <p className="text-center text-[12px] text-ink-soft">
                    No sign-up needed to start. We'll link you to {orgName} when you create a free account.
                  </p>
                </>
              )}
              {state === "error" && <p className="text-sm text-destructive">{msg}</p>}
            </div>

            <ul className="mt-8 space-y-2 text-[13px] text-ink-soft">
              <li>• Your pay and shifts stay private to you</li>
              <li>• UK plain English, guidance only</li>
              <li>• No banking, no lending, no wage advance</li>
            </ul>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Join your workplace</h1>
            <p className="mt-2 text-ink-soft">Enter the 6-character code your manager shared.</p>
            {lookupErr && initialCode && <p className="mt-3 text-sm text-destructive">{lookupErr}</p>}
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123" maxLength={6}
              className="mt-6 h-14 w-full rounded-2xl border border-border bg-card px-4 text-center font-display text-2xl font-extrabold tracking-[0.4em] outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={user ? joinAsSignedIn : enterAsGuest}
              disabled={state === "joining" || !code.trim()}
              className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary disabled:opacity-60"
            >
              {state === "joining" ? "Joining…" : "Continue"} <ArrowRight className="size-4" />
            </button>
            {state === "error" && <p className="mt-3 text-sm text-destructive">{msg}</p>}
          </>
        )}
      </main>
    </div>
  );
}
