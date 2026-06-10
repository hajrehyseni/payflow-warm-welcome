# PayFlow — Partner-Ready Report

**Date:** 2026-06-10
**Repo:** `payflow-warm-welcome` (live product behind https://payflow.londonra.com)
**Branch:** `smartphone-first-pass`
**Stack:** TanStack Start (React) + Vite + Tailwind · Supabase (auth + data) · Stripe (business billing) · Lovable AI gateway (Flow Coach)

This is the source behind the live site — verified by the landing hero ("Make sure
you're paid right. Free."), the `index/app/business/pricing/login/signup/join` routes,
and the Lovable/Vite/Supabase/Stripe markers.

---

## What changed (smartphone-first pass)

| Area | Change | Why it matters |
|---|---|---|
| **Shift accuracy** | Clocked shifts now file under the **local** date, not UTC (`localISODate`) | A shift ended just after midnight in UK summer time (BST) was landing on the wrong day / pay week. Verified fix: `2026-06-14` → `2026-06-15`. |
| **PWA foundation** | `manifest.webmanifest`, app `icon.svg`, `theme-color`, `apple-touch-icon`, `apple-mobile-web-app-*`, root `viewport-fit=cover` | Installs to the home screen and opens standalone at `/app` — feels like a real app, not a website. |
| **Mobile sign-in** | Landing header now shows **Sign in** on phones (was hidden behind `md:`) | Returning workers on a phone can reach their account, not just the guest app. |
| **App load** | Branded splash instead of a blank flash during cloud hydration | Smoother, calmer first paint. |

All changes are small and surgical (≈46 lines across 5 files + 2 PWA assets). **No payment
logic, Supabase security rules, or major screens were touched.**

## Compliance / payroll audit

- PAYE / NI / pension estimates are sound and **correctly scoped to the current week**
  (`thisWeekShifts`, Mon–Sun) — weekly thresholds are never applied to accumulated history.
- Estimate-only disclaimers appear on Today, Pay, Save, Coach and the landing page.
- Flow Coach is plain-English and framed as general information, not regulated advice.

## Security / secrets

- **No private secrets are committed.** The tracked `.env` contains only **client-safe
  publishable** values (Supabase publishable/anon key, Stripe `pk_` token, public URLs/IDs).
  `VITE_*` values ship to the browser by design, so they are public regardless.
- **Server secrets are correct:** `STRIPE_SECRET_KEY`, `STRIPE_LIVE_API_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `DATABASE_URL` are read from `process.env`
  at runtime (injected by the host), never in the repo.
- `.gitignore` already ignores `*.local`, so future local secrets (`.env.local`) are safe.
- Added **`.env.example`** documenting required vars and which are server-only.

## Build & verification

- `npm run build` → **passes** (~360ms). Dev server boots clean; `/` and `/app` return 200;
  `manifest.webmanifest` serves 200; new mobile meta present in SSR head.
- Lint shows pre-existing Prettier formatting noise only — **not** touched (mass-format would
  be a large risky diff with no product value). Run `npm run format` separately if you want
  green lint.

## How to demo (mobile)

1. Open the site on a phone → tap **Open PayFlow**.
2. **Start shift** → watch live earnings tick up → **Start break** → **Resume** → **End shift**.
3. **Pay** tab → take-home + PAYE/NI/pension breakdown → tap **Check my pay**.
4. **Save** → pick £5/shift → move to savings. **Coach** → "Why is my take-home less than my gross?"

## Optional follow-ups (not blocking partner share)

- Real PNG PWA icons (180/192/512) for a crisper iOS home-screen tile — the SVG is a clean foundation.
- `npm run format` for green lint.
- Decide whether to untrack `.env` (safe to leave: client-safe + the deploy may rely on it).
