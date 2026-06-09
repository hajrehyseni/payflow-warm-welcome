import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Mail, CheckCircle2 } from "lucide-react";
import { loginWithEmail, auth } from "@/lib/payflow/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PayFlow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
  }

  function proceed() {
    const u = loginWithEmail(email);
    nav({ to: u.role === "business" ? "/business" : "/app" });
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-stretch px-6 pt-16 pb-20">
        {!sent ? (
          <>
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
              <Mail className="size-3.5" /> Sign in with email
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">Welcome back.</h1>
            <p className="mt-2 text-ink-soft">We'll send you a magic link — no password.</p>
            <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.com"
                className="h-14 rounded-2xl border border-border bg-card px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-6 text-base font-bold text-sand hover:bg-primary transition-colors">
                Send magic link <ArrowRight className="size-4" />
              </button>
            </form>
            <p className="mt-6 text-sm text-ink-soft">
              New here? <Link to="/signup" className="font-bold text-primary">Create an account</Link>
            </p>
          </>
        ) : (
          <div className="mt-6 rounded-3xl bg-card p-8 ring-1 ring-border text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">Check your inbox</h2>
            <p className="mt-2 text-sm text-ink-soft">We've sent a link to <span className="font-semibold text-ink">{email}</span>. Tap it to sign in.</p>
            <button
              onClick={proceed}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-bold text-accent-foreground"
            >
              Continue (demo) <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-[11px] text-ink-soft">Real email delivery comes when we wire up Lovable Cloud.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 bg-sand/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
          <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
        </Link>
        <Link to="/signup" className="text-sm font-bold text-ink hover:text-primary">Sign up</Link>
      </div>
    </header>
  );
}

// dummy import to avoid unused warning if needed
void auth;
