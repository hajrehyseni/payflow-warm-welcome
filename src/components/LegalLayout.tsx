import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand text-ink overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-[700px] rounded-full bg-primary/20 blur-3xl opacity-70" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-sand/70 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight">PayFlow</span>
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Open PayFlow <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Back to home
        </Link>

        <h1 className="mt-6 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated: {updated}</p>
        {intro && <p className="mt-6 text-[15px] leading-relaxed text-ink">{intro}</p>}

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:mb-2 [&_h2]:mt-8 [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p]:text-ink-soft [&_li]:text-ink-soft [&_a]:text-primary [&_a]:underline">
          {children}
        </div>

        <div className="mt-14 border-t border-border/60 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="size-3.5" /> Back to home
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/60 py-10 mt-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:px-6 text-xs text-ink-soft md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="font-display font-bold text-ink">PayFlow</span>
            <span>· by Londonra Ltd, London UK</span>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms</Link>
            <Link to="/cookie-policy">Cookies</Link>
            <a href="mailto:info@londonra.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
