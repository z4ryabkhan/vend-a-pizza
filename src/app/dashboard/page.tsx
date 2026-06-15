import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import DecisionBadge from "@/components/DecisionBadge";
import { listCouncilSessions } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { councilTypeLabel } from "@/lib/council";
import type { CouncilSession, FinalDecision } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard — FounderCouncil AI",
};

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  let sessions: CouncilSession[] = [];
  let loadError: string | null = null;

  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      sessions = await listCouncilSessions(100);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load data.";
    }
  }

  const total = sessions.length;
  const counts: Record<FinalDecision, number> = {
    Proceed: 0,
    Pause: 0,
    Reject: 0,
  };
  let confidenceSum = 0;
  for (const s of sessions) {
    const decision = s.chairman_response?.finalDecision;
    if (decision && decision in counts) counts[decision] += 1;
    confidenceSum += s.chairman_response?.confidenceScore ?? 0;
  }
  const avgConfidence = total ? Math.round(confidenceSum / total) : 0;
  const recent = sessions.slice(0, 5);

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              An overview of your council sessions.
            </p>
          </div>
          <Link
            href="/council"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            New council
          </Link>
        </header>

        {!isSupabaseConfigured() ? (
          <EmptyConfig />
        ) : loadError ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {loadError}
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total sessions" value={total} />
              <StatCard label="Avg. confidence" value={`${avgConfidence}`} />
              <StatCard label="Proceed" value={counts.Proceed} />
              <StatCard label="Pause / Reject" value={counts.Pause + counts.Reject} />
            </div>

            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Recent sessions
                </h2>
                <Link
                  href="/history"
                  className="text-sm font-medium text-brand-300 hover:text-brand-200"
                >
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-400">
                  No sessions yet.{" "}
                  <Link href="/council" className="text-brand-300 underline">
                    Convene your first council.
                  </Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {recent.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/results/${s.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-brand-500/40 hover:bg-white/[0.07]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-100">
                            {s.question}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {councilTypeLabel(s.council_type)} ·{" "}
                            {new Date(s.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {s.chairman_response?.finalDecision && (
                          <DecisionBadge
                            decision={s.chairman_response.finalDecision}
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}

function EmptyConfig() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
      <h2 className="font-semibold text-amber-100">Supabase not configured</h2>
      <p className="mt-2 text-sm text-amber-200/90">
        Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
        <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to enable
        saved sessions, dashboard stats, and history. See{" "}
        <code className="font-mono">.env.example</code> and{" "}
        <code className="font-mono">supabase/schema.sql</code>. You can still run
        a council now — results just won&apos;t be saved.
      </p>
    </div>
  );
}
