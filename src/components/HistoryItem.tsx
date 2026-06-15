"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DecisionBadge from "./DecisionBadge";
import { councilTypeLabel } from "@/lib/council";
import type { CouncilSession } from "@/lib/types";

export default function HistoryItem({ session }: { session: CouncilSession }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/council/${session.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/5 transition hover:border-brand-500/40 hover:bg-white/[0.07]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <Link href={`/results/${session.id}`} className="min-w-0 flex-1">
          <p className="font-medium text-slate-100">{session.question}</p>
          <p className="mt-1 text-xs text-slate-500">
            {councilTypeLabel(session.council_type)} ·{" "}
            {new Date(session.created_at).toLocaleString()} · Confidence{" "}
            {session.chairman_response?.confidenceScore ?? "—"}/100
          </p>
          {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
        </Link>

        <div className="flex items-center gap-2">
          {session.chairman_response?.finalDecision && (
            <DecisionBadge decision={session.chairman_response.finalDecision} />
          )}
          {confirming ? (
            <span className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600/90 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              aria-label="Delete session"
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
