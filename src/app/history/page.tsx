import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import DecisionBadge from "@/components/DecisionBadge";
import { listCouncilSessions } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { councilTypeLabel } from "@/lib/council";
import type { CouncilSession } from "@/lib/types";

export const metadata: Metadata = {
  title: "History — FounderCouncil AI",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let sessions: CouncilSession[] = [];
  let loadError: string | null = null;
  const configured =
    isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (configured) {
    try {
      sessions = await listCouncilSessions(100);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load history.";
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              History
            </h1>
            <p className="mt-2 text-slate-400">
              Every council session you&apos;ve run.
            </p>
          </div>
          <Link
            href="/council"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            New council
          </Link>
        </header>

        {!configured ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Supabase isn&apos;t configured, so there&apos;s no saved history yet.
            Add your Supabase keys to start recording sessions.
          </p>
        ) : loadError ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {loadError}
          </p>
        ) : sessions.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-10 text-center text-slate-400">
            No sessions yet.{" "}
            <Link href="/council" className="text-brand-300 underline">
              Convene your first council.
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/results/${s.id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-brand-500/40 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-100">{s.question}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {councilTypeLabel(s.council_type)} ·{" "}
                        {new Date(s.created_at).toLocaleString()} · Confidence{" "}
                        {s.chairman_response?.confidenceScore ?? "—"}/100
                      </p>
                    </div>
                    {s.chairman_response?.finalDecision && (
                      <DecisionBadge
                        decision={s.chairman_response.finalDecision}
                      />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
