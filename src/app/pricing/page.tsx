import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import PricingButton from "@/components/PricingButton";

export const metadata: Metadata = {
  title: "Pricing — FounderCouncil AI",
};

const PLANS = [
  {
    name: "Starter",
    price: "£19",
    period: "/month",
    description: "For founders making occasional strategic decisions.",
    limit: "5 councils/month",
    priceIdEnv: "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID",
    features: [
      "5 council sessions per month",
      "All 4 AI advisor seats",
      "Chairman verdict on every session",
      "Session history",
      "14-day free trial",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: "£49",
    period: "/month",
    description: "For active founders who need weekly advisory input.",
    limit: "25 councils/month",
    priceIdEnv: "NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID",
    features: [
      "25 council sessions per month",
      "All 4 AI advisor seats",
      "Chairman verdict on every session",
      "Full session history & export",
      "Priority model access",
      "14-day free trial",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "£99",
    period: "/month",
    description: "For power users and small teams with no limits.",
    limit: "Unlimited councils",
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
    features: [
      "Unlimited council sessions",
      "All 4 AI advisor seats",
      "Chairman verdict on every session",
      "Full session history & export",
      "Priority model access",
      "14-day free trial",
    ],
    popular: false,
  },
] as const;

export default function PricingPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Start your 14-day free trial with no credit card required. Cancel
            anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const priceId =
              (
                process.env as Record<string, string | undefined>
              )[plan.priceIdEnv] ?? "";

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition ${
                  plan.popular
                    ? "border-brand-500 bg-brand-600/10 shadow-lg shadow-brand-900/30"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-brand-300">
                    {plan.limit}
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8l3.5 3.5 6.5-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <PricingButton
                    planName={plan.name}
                    priceId={priceId}
                    popular={plan.popular}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-sm text-slate-500">
          All plans include a 14-day free trial. No credit card required at
          signup. You&apos;ll be prompted for payment details before your trial
          ends.
        </p>
      </div>
    </SiteShell>
  );
}
