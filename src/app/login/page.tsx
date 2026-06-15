import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Sign in — FounderCouncil AI",
};

export default function LoginPage() {
  return (
    <div className="bg-aurora flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          FC
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">
          FounderCouncil <span className="text-brand-400">AI</span>
        </span>
      </Link>

      {isSupabaseConfigured() ? (
        <Suspense
          fallback={
            <div className="h-72 w-full max-w-md animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          }
        >
          <LoginForm />
        </Suspense>
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <h1 className="text-xl font-bold text-amber-100">Demo mode</h1>
          <p className="mt-2 text-sm text-amber-200/90">
            Supabase isn&apos;t configured, so authentication is disabled. You can
            still run a council — results just won&apos;t be saved.
          </p>
          <Link
            href="/council"
            className="mt-5 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Try a council
          </Link>
        </div>
      )}
    </div>
  );
}
