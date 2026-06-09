## Goal
Add an in-app "Connected Stripe account" panel on `/business` so you can confirm at a glance which Stripe account (and which environment) is wired up — and therefore where payouts will land.

## What you'll see
A small card in the Billing section of `/business` showing:
- **Account email** — e.g. `hajra.hyseni@gmail.com`
- **Business / account name** — e.g. `London Royal Academy` (if set in Stripe)
- **Country** — e.g. `GB`
- **Environment** — `Test mode (sandbox)` or `Live`
- **Charges enabled / Payouts enabled** — green/red pills, so you immediately see if live payouts are actually unlocked
- **Account ID** — last 6 chars, for support reference

If env is `sandbox`, a clear note: *"This is the test sandbox. No real money moves until go-live is complete."*

## How it works (technical)

1. **New server function** `getConnectedStripeAccount` in `src/lib/payflow/billing.functions.ts`:
   - Uses `createStripeClient(env)` from `@/lib/stripe.server`
   - Calls `stripe.accounts.retrieve()` (the connected account behind the gateway connection)
   - Returns `{ email, businessName, country, accountId, chargesEnabled, payoutsEnabled, environment }`
   - Wrapped in try/catch returning `{ error }` per the Stripe error-surfacing rule
   - No auth middleware needed for read-only account metadata, but we'll gate it to authenticated business users via `requireSupabaseAuth` to be safe

2. **New component** `src/components/payflow/ConnectedAccountCard.tsx`:
   - Calls the server fn via `useServerFn` + `useQuery`
   - Renders the card with the fields above
   - Shows a skeleton while loading and a friendly error state if Stripe call fails

3. **Wire into `/business`**: render `<ConnectedAccountCard />` directly under the Billing card (same right column), so it sits next to the "Manage billing" / "Start subscription" CTA.

4. **No DB changes, no migration, no new env vars.** Purely a read from Stripe through the existing gateway.

## Out of scope
- No changes to checkout, webhook, pricing, or the go-live flow.
- We won't try to *change* the Stripe email from the app — that stays in the Stripe dashboard.
