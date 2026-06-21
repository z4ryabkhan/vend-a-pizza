"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  planName: string;
  priceId: string;
  popular?: boolean;
}

export default function PricingButton({ planName, priceId, popular }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!priceId) {
      alert("Stripe Price ID not configured. Add it to your .env.local.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (res.status === 401) {
        router.push("/login?redirect=/pricing");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to create checkout session.");
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
        popular
          ? "bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-900/40"
          : "border border-white/15 bg-white/5 hover:bg-white/10"
      }`}
    >
      {loading ? "Redirecting…" : "Start Free Trial"}
    </button>
  );
}
