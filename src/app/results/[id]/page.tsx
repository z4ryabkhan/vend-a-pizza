import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import VerdictView from "@/components/VerdictView";
import SeatCard from "@/components/SeatCard";
import { getCouncilSession } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { councilTypeLabel } from "@/lib/council";

export const metadata: Metadata = {
  title: "Council Result — FounderCouncil AI",
};

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl font-bold text-white">
            Saved results unavailable
          </h1>
          <p className="mt-3 text-slate-400">
            Supabase isn&apos;t configured, so individual results can&apos;t be
            loaded. Configure Supabase to enable permalinks and history.
          </p>
          <Link
            href="/council"
            className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Run a council
          </Link>
        </div>
      </SiteShell>
    );
  }

  const session = await getCouncilSession(params.id);
  if (!session) notFound();

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/history"
          className="text-sm text-brand-300 hover:text-brand-200"
        >
          ← Back to history
        </Link>

        <header className="mb-8 mt-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {councilTypeLabel(session.council_type)} ·{" "}
            {new Date(session.created_at).toLocaleString()}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {session.question}
          </h1>
        </header>

        <VerdictView verdict={session.chairman_response} />

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Advisor responses
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {session.model_responses.map((r) => (
              <SeatCard key={r.seat} response={r} />
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
