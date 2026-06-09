import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, FlaskConical, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getConnectedStripeAccount } from "@/lib/payflow/billing.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export function StripeStatusBanner() {
  const [authed, setAuthed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  let env: "sandbox" | "live" | null = null;
  let configError: string | null = null;
  try {
    env = getStripeEnvironment();
  } catch (e) {
    configError = e instanceof Error ? e.message : "Payments not configured";
  }

  const fetchAccount = useServerFn(getConnectedStripeAccount);
  const { data } = useQuery({
    queryKey: ["stripe-status-banner", env],
    queryFn: () => fetchAccount({ data: { environment: env as "sandbox" | "live" } }),
    enabled: authed && !!env,
    staleTime: 60_000,
    retry: false,
  });

  if (dismissed) return null;

  // Not configured / disconnected
  if (configError) {
    return (
      <Banner
        tone="red"
        icon={<AlertTriangle className="size-4" />}
        title="Payments not connected"
        message="Stripe is disconnected. Reconnect from the Payments dashboard to accept payments."
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  // Server-side error (e.g. missing secrets, bad key)
  if (data && "error" in data) {
    return (
      <Banner
        tone="red"
        icon={<AlertTriangle className="size-4" />}
        title="Payments need reconnecting"
        message={data.error}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  // Test mode
  if (env === "sandbox") {
    const email = data && !("error" in data) ? data.email : null;
    return (
      <Banner
        tone="amber"
        icon={<FlaskConical className="size-4" />}
        title="Test mode"
        message={`Preview uses Stripe test mode — no real charges${email ? ` · Connected: ${email}` : ""}. Your published site runs in live mode.`}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  // Live mode — payouts disabled
  if (data && !("error" in data) && !data.payoutsEnabled) {
    return (
      <Banner
        tone="amber"
        icon={<AlertTriangle className="size-4" />}
        title="Live mode · Payouts off"
        message={`Connected to ${data.email ?? "Stripe"} but payouts aren't enabled yet.`}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  // Live + healthy
  if (env === "live" && data && !("error" in data)) {
    return (
      <Banner
        tone="green"
        icon={<CheckCircle2 className="size-4" />}
        title="Live payments active"
        message={`Payouts going to ${data.email ?? "your connected Stripe account"}.`}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  return null;
}

function Banner({
  tone,
  icon,
  title,
  message,
  onDismiss,
}: {
  tone: "amber" | "red" | "green";
  icon: React.ReactNode;
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  const styles = {
    amber: "bg-amber-100 text-amber-900 ring-amber-200",
    red: "bg-red-100 text-red-900 ring-red-200",
    green: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  }[tone];
  return (
    <div className={`w-full px-4 py-2 text-xs font-semibold ring-1 ${styles}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        {icon}
        <span className="font-bold">{title}:</span>
        <span className="truncate font-medium">{message}</span>
        <button
          onClick={onDismiss}
          className="ml-auto rounded px-2 py-0.5 text-[11px] opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
