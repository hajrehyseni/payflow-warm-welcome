## Goal
Make first-run, join, and business journeys frictionless without breaking guest-first access, auth, reconciled numbers, the hero demo, or guidance-only positioning.

## Worker

1. **First-run "Let's set you up" wizard** (replaces current 5-card welcome carousel for guests)
   - Step 1: Hourly rate (prefilled £14.50, editable)
   - Step 2: Pay cycle — Weekly / Every 2 weeks / Monthly, plus next payday date
   - Step 3: Workplace name (optional, prefilled "Maple Care Home")
   - "Explore with sample data first" link skips wizard
   - Persisted in store as `hourlyRateDefault`, `workplaceDefault`, `payCycle`, `nextPayday`, `usingSampleData` flag
   - If skipped: Today shows a small "Sample data" chip + one-tap "Use my own numbers" reopens wizard, and on first wizard save we wipe seed shifts

2. **Today screen polish**
   - Wire `nextPayday` from store into the payday chip (replace `nextFriday()`)
   - When `usingSampleData` true: subtle pill near greeting + "Use my own numbers →" CTA
   - Keep one obvious primary action; shift end already shows "Nice work" toast — keep

3. **Account creation prompt** — already exists post-shift via `CloudUpload` nudge. Verify copy is warm and post-first-shift only (it is).

## Join (worker ↔ employer)

4. **Warm /join?code=...**
   - On load, resolve the code to an org name **without requiring sign-in** (new public server fn `lookupOrgByCode` using `supabaseAdmin`; returns only `{ name }`)
   - Show "{Company} invited you to PayFlow — free for you, forever" with one big "Join {Company}" button
   - If user is signed in → call existing `join_org_with_code` RPC, then `/app`
   - If guest → store pending code in localStorage and route to `/app` immediately as guest (shifts/savings stay); show inline post-signup banner offering to link to {Company}. After they sign up later, auto-call `join_org_with_code` with the stored code.

## Business

5. **/business signup smoothness** — already exists via `/signup` → magic link → `/business`. Keep, but tighten copy: "Start free — 90-day pilot. No card."

6. **Invite hero on /business dashboard**
   - Promote invite block to top of main content (above metrics)
   - Big shareable link, large join code, **QR code** (use `qrcode` npm package — already lightweight), Copy button, "Share to WhatsApp" (`https://wa.me/?text=`) and "Share via email" (`mailto:`)
   - Below: simple roster card showing org_members with profile name + joined date + "active this month" badge (queried via new server fn `getOrgRoster` using admin client, requires owner check)

7. **Keep value metrics + plan strip** — already present; move below invite hero.

8. **Pilot → subscribe path** — already wired through `BusinessCheckoutModal`. Add prominent "Start subscription — £{monthly}/mo" CTA in plan strip when pilot is active with days-left countdown.

## Technical changes

```text
src/lib/payflow/store.ts
  + State: payCycle ('weekly'|'biweekly'|'monthly'), nextPayday (ISO), usingSampleData (bool)
  + actions: applySetup({rate, workplace, cycle, payday}) → also clears seed shifts when usingSampleData was true
  + helper: computeNextPayday(cycle, anchor)

src/components/app/screens.tsx
  - Onboarding component → replace with SetupWizard (3 steps + skip)
  - TodayScreen: use store payday, show sample-data chip + reset CTA
  - Add small SampleDataBanner

src/lib/payflow/join.functions.ts (new)
  + lookupOrgByCode (public, admin client, returns {name} only)
  + getOrgRoster (auth + owner check)

src/routes/join.tsx
  - Refactor to load org name on mount via lookupOrgByCode
  - "Join {Company}" CTA works for both guests (store code, go to /app) and signed-in users (RPC then /app)
  - Post-signup auto-link: in src/lib/payflow/auth.ts after sign-in, check localStorage for pending join code and call RPC

src/routes/business.tsx
  - New InviteHero component with QR + share buttons + roster
  - Move metrics below
  - Strengthen pilot countdown CTA

bun add qrcode  (+ types)
```

## Out of scope (won't touch)
- DB schema / migrations (no new tables needed — roster reads from existing `org_members` + `profiles`)
- Stripe checkout logic
- Hero demo, landing page
- Auth providers
- Pricing logic

## Acceptance
- Brand-new guest at `/app` sees Setup wizard, not the old 5-card welcome
- Skipping → "Sample data" chip visible; reset CTA opens same wizard
- `/join?code=XXX` shows company name before sign-in; guest path works
- `/business` lands on Invite hero with QR + share + roster
- Existing auth, reconciled £493 weekly demo, hero demo, and disclaimers untouched
