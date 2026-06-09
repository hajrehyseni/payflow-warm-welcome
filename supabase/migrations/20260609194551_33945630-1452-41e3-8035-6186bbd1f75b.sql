
ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pilot_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS billable_workers INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS environment TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_stripe_sub ON public.organisations(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
