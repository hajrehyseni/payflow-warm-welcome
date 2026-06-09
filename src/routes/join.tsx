import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ensureInitialised } from "@/lib/payflow/auth";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join your workplace — PayFlow" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ code: (s.code as string) || "" }),
  component: JoinPage,
});

function JoinPage() {
  const { code: initialCode } = Route.useSearch();
  const user = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState(initialCode || "");
  const [state, setState] = useState<"idle" | "joining" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => { void ensureInitialised(); }, []);

  async function join() {
    if (!code.trim()) return;
    if (!user) { nav({ to: "/signup" }); return; }
    setState("joining"); setMsg("");
    const { data, error } = await (supabase.rpc as any)("join_org_with_code", { _code: code.trim().toUpperCase() });
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      setState("error");
      setMsg("That code doesn't match a workplace. Double-check with your manager.");
      return;
    }
    setState("done"); setMsg((data[0] as { org_name: string }).org_name);
  }

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
        {state !== "done" ? (
          <>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Join your workplace</h1>
            <p className="mt-2 text-ink-soft">Enter the 6-character code your manager shared. Your pay and shifts stay private — you control what you track.</p>
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123" maxLength={6}
              className="mt-6 h-14 w-full rounded-2xl border border-border bg-card px-4 text-center font-display text-2xl font-extrabold tracking-[0.4em] outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={join} disabled={state === "joining"}
              className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary disabled:opacity-60"
            >
              {user ? (state === "joining" ? "Joining…" : "Join workplace") : "Sign in to join"}
              <ArrowRight className="size-4" />
            </button>
            {state === "error" && <p className="mt-3 text-sm text-destructive">{msg}</p>}
            {!user && <p className="mt-4 text-sm text-ink-soft">Don't have an account? <Link to="/signup" className="font-bold text-primary">Sign up free</Link>.</p>}
          </>
        ) : (
          <div className="rounded-3xl bg-card p-8 ring-1 ring-border text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">You're in.</h2>
            <p className="mt-2 text-sm text-ink-soft">Welcome to <span className="font-semibold text-ink">{msg}</span>. Your pay stays private.</p>
            <button onClick={() => nav({ to: "/app" })} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-sm font-bold text-sand">Open PayFlow <ArrowRight className="size-4" /></button>
          </div>
        )}
      </main>
    </div>
  );
}
