import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Building2, Mail, Globe, ShieldAlert } from "lucide-react";
import { getConnectedStripeAccount } from "@/lib/payflow/billing.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export function ConnectedAccountCard() {
  const fetchAccount = useServerFn(getConnectedStripeAccount);
  const { data, isLoading, error } = useQuery({
    queryKey: ["stripe-connected-account"],
    queryFn: () => fetchAccount({ data: { environment: getStripeEnvironment() } }),
  });

  return (
    <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
        <Building2 className="size-3.5" /> Connected payout account
      </div>

      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-sand-deep" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-sand-deep" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-sand-deep" />
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700">Couldn't load Stripe account details.</p>
      )}

      {data && "error" in data && (
        <p className="mt-3 text-sm text-red-700">{data.error}</p>
      )}

      {data && !("error" in data) && (
        <>
          <div className="mt-3 space-y-2 text-sm">
            <Row icon={<Mail className="size-3.5" />} k="Email" v={data.email ?? "—"} mono />
            <Row icon={<Building2 className="size-3.5" />} k="Business" v={data.businessName ?? "—"} />
            <Row icon={<Globe className="size-3.5" />} k="Country" v={data.country ?? "—"} />
            <Row
              icon={null}
              k="Environment"
              v={data.environment === "sandbox" ? "Test mode (sandbox)" : "Live"}
            />
            <Row icon={null} k="Account ID" v={`…${data.accountId.slice(-6)}`} mono />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill on={data.chargesEnabled} label={data.chargesEnabled ? "Charges enabled" : "Charges off"} />
            <Pill on={data.payoutsEnabled} label={data.payoutsEnabled ? "Payouts enabled" : "Payouts off"} />
          </div>

          {data.environment === "sandbox" && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <p className="text-[12px] leading-relaxed text-amber-900">
                This is the test sandbox. No real money moves to this account until Stripe go-live is complete.
                Verify the email above matches the Stripe account where your business is set up.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ icon, k, v, mono }: { icon: React.ReactNode; k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
      <span className="flex items-center gap-1.5 text-ink-soft">
        {icon}
        {k}
      </span>
      <span className={`truncate font-bold ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
    </div>
  );
}

function Pill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        on ? "bg-primary-soft text-primary" : "bg-red-100 text-red-700"
      }`}
    >
      {on ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
      {label}
    </span>
  );
}
