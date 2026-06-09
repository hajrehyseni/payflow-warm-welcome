import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, User, Building2, CheckCircle2 } from "lucide-react";
import { signupWorker, signupBusiness } from "@/lib/payflow/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — PayFlow" }] }),
  component: SignupPage,
});

type Step = "role" | "worker" | "business" | "sent";

function SignupPage() {
  const [step, setStep] = useState<Step>("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitWorker(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) return;
    setBusy(true); setErr(null);
    try { await signupWorker(name, email); setStep("sent"); }
    catch (e: any) { setErr(e?.message ?? "Something went wrong. Try again."); }
    finally { setBusy(false); }
  }
  async function submitBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || !company.trim()) return;
    setBusy(true); setErr(null);
    try { await signupBusiness(name, email, company); setStep("sent"); }
    catch (e: any) { setErr(e?.message ?? "Something went wrong. Try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="border-b border-border/60 bg-sand/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <Link to="/login" className="text-sm font-bold text-ink hover:text-primary">Sign in</Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 pt-12 pb-20">
        {step === "role" && (
          <>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">Who are you?</h1>
            <p className="mt-2 text-ink-soft">Pick the one that fits. You can change later.</p>
            <div className="mt-8 space-y-3">
              <button
                onClick={() => setStep("worker")}
                className="group flex w-full items-center gap-4 rounded-3xl bg-card p-5 text-left ring-1 ring-border hover:ring-primary transition-all"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><User className="size-6" /></div>
                <div className="flex-1">
                  <div className="font-display text-lg font-extrabold">I'm a worker</div>
                  <div className="text-sm text-ink-soft">Track shifts, see take-home, save gently.</div>
                </div>
                <div className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">Free forever</div>
              </button>
              <button
                onClick={() => setStep("business")}
                className="group flex w-full items-center gap-4 rounded-3xl bg-card p-5 text-left ring-1 ring-border hover:ring-primary transition-all"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent"><Building2 className="size-6" /></div>
                <div className="flex-1">
                  <div className="font-display text-lg font-extrabold">I'm a business or agency</div>
                  <div className="text-sm text-ink-soft">Give your team clear pay. Cut payroll queries.</div>
                </div>
                <div className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent">From £99/mo</div>
              </button>
            </div>
          </>
        )}

        {step === "worker" && (
          <>
            <button onClick={() => setStep("role")} className="text-sm font-semibold text-ink-soft hover:text-ink">← Back</button>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Welcome aboard.</h1>
            <p className="mt-2 text-ink-soft">No password needed. We'll send a magic link.</p>
            <form onSubmit={submitWorker} className="mt-8 flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30" />
              <button disabled={busy} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary transition-colors disabled:opacity-60">
                {busy ? "Sending…" : (<>Send magic link <ArrowRight className="size-4" /></>)}
              </button>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <p className="mt-1 text-[11px] text-ink-soft">PayFlow gives estimates only. It is not financial, tax or payroll advice.</p>
            </form>
          </>
        )}

        {step === "business" && (
          <>
            <button onClick={() => setStep("role")} className="text-sm font-semibold text-ink-soft hover:text-ink">← Back</button>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Set up your workspace.</h1>
            <p className="mt-2 text-ink-soft">Start a 90-day free pilot. No card needed.</p>
            <form onSubmit={submitBusiness} className="mt-8 flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Work email" className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Company name" className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30" />
              <button disabled={busy} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-base font-bold text-accent-foreground hover:scale-[1.01] transition-transform disabled:opacity-60">
                {busy ? "Sending…" : (<>Start free pilot <ArrowRight className="size-4" /></>)}
              </button>
              {err && <p className="text-sm text-destructive">{err}</p>}
            </form>
          </>
        )}

        {step === "sent" && (
          <div className="mt-6 rounded-3xl bg-card p-8 ring-1 ring-border text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">Check your inbox</h2>
            <p className="mt-2 text-sm text-ink-soft">We've sent a link to <span className="font-semibold text-ink">{email}</span>. Tap it to finish signing in.</p>
            <p className="mt-4 text-[11px] text-ink-soft">Didn't see it? Check spam, or try again in a minute.</p>
          </div>
        )}
      </main>
    </div>
  );
}
