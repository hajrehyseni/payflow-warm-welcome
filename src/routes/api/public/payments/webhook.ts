import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook, type StripeEnv } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

function iso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function upsertOrgSubscription(sub: any, env: StripeEnv) {
  const orgId = sub.metadata?.orgId;
  if (!orgId) {
    console.warn("subscription has no orgId metadata", sub.id);
    return;
  }
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  await (getSupabase().from("organisations") as any)
    .update({
      stripe_customer_id: customer,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      current_period_end: iso(periodEnd),
      environment: env,
      plan: sub.status === "active" || sub.status === "trialing" ? "active" : "pilot",
    })
    .eq("id", orgId);
}

async function markCanceled(sub: any, env: StripeEnv) {
  await (getSupabase().from("organisations") as any)
    .update({ subscription_status: "canceled", plan: "pilot", environment: env })
    .eq("stripe_subscription_id", sub.id);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertOrgSubscription(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await markCanceled(event.data.object, env);
      break;
    default:
      console.log("Unhandled payment event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
