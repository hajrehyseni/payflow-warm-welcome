import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createBusinessCheckout } from "@/lib/payflow/billing.functions";
import { X } from "lucide-react";

export function BusinessCheckoutModal({ onClose }: { onClose: () => void }) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createBusinessCheckout({
      data: {
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/business?checkout=success`,
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Could not start checkout.");
    return result.clientSecret;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 p-4 pt-10 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-sand p-2 shadow-2xl ring-1 ring-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-ink/80 text-sand hover:bg-ink"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <div className="overflow-hidden rounded-2xl bg-card">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}

export function PaymentTestModeBanner() {
  const token = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
  if (!token) return null;
  if (!token.startsWith("pk_test_")) return null;
  return (
    <div className="w-full bg-amber-100 px-4 py-1.5 text-center text-[11px] font-semibold text-amber-900">
      Test mode — no real payments will be charged.
    </div>
  );
}
