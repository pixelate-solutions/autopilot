import Stripe from "stripe";

let stripe: Stripe | undefined;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required for payment operations.");
  }

  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export function paymentRuleForEstimate(estimateCents: number) {
  if (estimateCents <= 20000) return "auto_charge" as const;
  if (estimateCents <= 100000) return "approval_required" as const;
  return "deposit_then_final" as const;
}

export async function createJobPaymentIntent(input: {
  stripeCustomerId: string;
  amountCents: number;
  jobId: string;
  householdId: string;
  captureMethod?: "automatic" | "manual";
}) {
  const client = getStripe();
  return client.paymentIntents.create({
    customer: input.stripeCustomerId,
    amount: input.amountCents,
    currency: "usd",
    capture_method: input.captureMethod ?? "automatic",
    metadata: {
      jobId: input.jobId,
      householdId: input.householdId,
    },
  });
}
