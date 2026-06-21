// Re-export db subscription helpers so the webhook route has a single import.
export {
  upsertSubscription,
  cancelSubscription,
} from "./db";

/** Maps a Stripe Price ID to a plan name. Falls back to 'unknown'. */
export function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID)
    return "starter";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID)
    return "growth";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro";
  return "unknown";
}
