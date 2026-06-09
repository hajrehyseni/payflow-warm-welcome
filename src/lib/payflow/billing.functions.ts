import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";
import { tierFor, billableQuantity } from "@/lib/payflow/pricing";

type CheckoutResult = { clientSecret: string } | { error: string };
type PortalResult = { url: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  opts: { email?: string; orgId: string; userId: string; orgName?: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9-]+$/.test(opts.orgId)) throw new Error("Invalid orgId");
  const found = await stripe.customers.search({
    query: `metadata['orgId']:'${opts.orgId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;

  if (opts.email) {
    const existing = await stripe.customers.list({ email: opts.email, limit: 1 });
    if (existing.data.length) {
      const c = existing.data[0];
      await stripe.customers.update(c.id, {
        metadata: { ...c.metadata, orgId: opts.orgId, userId: opts.userId },
      });
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(opts.email && { email: opts.email }),
    ...(opts.orgName && { name: opts.orgName }),
    metadata: { orgId: opts.orgId, userId: opts.userId },
  });
  return created.id;
}

export const createBusinessCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { supabase, userId } = context;
      const { data: orgRow, error: orgErr } = await supabase
        .from("organisations")
        .select("id, name, stripe_customer_id")
        .eq("owner_id", userId)
        .maybeSingle();
      if (orgErr || !orgRow) return { error: "No organisation found for this account." };

      // Aggregate read for billable worker count
      const { data: agg } = await supabase.rpc("get_org_aggregates", { _org_id: orgRow.id });
      const activeWorkers = Array.isArray(agg) && agg[0] ? Number((agg[0] as any).active_workers ?? 0) : 0;
      const tier = tierFor(activeWorkers);
      const qty = billableQuantity(activeWorkers);

      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? undefined;

      const stripe = createStripeClient(data.environment);
      const customerId = orgRow.stripe_customer_id
        ? orgRow.stripe_customer_id
        : await resolveOrCreateCustomer(stripe, { email, orgId: orgRow.id, userId, orgName: orgRow.name });

      if (!orgRow.stripe_customer_id) {
        await supabase.from("organisations").update({ stripe_customer_id: customerId }).eq("id", orgRow.id);
      }

      const prices = await stripe.prices.list({ lookup_keys: [tier.priceId] });
      if (!prices.data.length) return { error: "Pricing not configured. Please contact support." };

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: prices.data[0].id, quantity: qty }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        automatic_tax: { enabled: true },
        tax_id_collection: { enabled: true },
        customer_update: { name: "auto", address: "auto" },
        metadata: { orgId: orgRow.id, userId, tier: tier.priceId },
        subscription_data: {
          metadata: { orgId: orgRow.id, userId, tier: tier.priceId },
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createBusinessPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PortalResult> => {
    try {
      const { supabase, userId } = context;
      const { data: orgRow } = await supabase
        .from("organisations")
        .select("stripe_customer_id")
        .eq("owner_id", userId)
        .maybeSingle();
      if (!orgRow?.stripe_customer_id) return { error: "No active subscription to manage yet." };

      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: orgRow.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type AccountResult =
  | {
      accountId: string;
      email: string | null;
      businessName: string | null;
      country: string | null;
      chargesEnabled: boolean;
      payoutsEnabled: boolean;
      detailsSubmitted: boolean;
      environment: StripeEnv;
    }
  | { error: string };

export const getConnectedStripeAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }): Promise<AccountResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const account = await stripe.accounts.retrieve();
      return {
        accountId: account.id,
        email: account.email ?? null,
        businessName:
          account.business_profile?.name ??
          (account as any).settings?.dashboard?.display_name ??
          null,
        country: account.country ?? null,
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        detailsSubmitted: Boolean(account.details_submitted),
        environment: data.environment,
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
