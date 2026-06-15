"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNCIL_TYPES } from "@/lib/council";
import type { CouncilRunResult, CouncilType } from "@/lib/types";
import VerdictView from "./VerdictView";
import SeatCard from "./SeatCard";

const EXAMPLES = [
  "Should we pivot our B2B SaaS to a self-serve PLG model next quarter?",
  "Is now the right time to raise a seed round, or should we bootstrap further?",
  "Should we build our own payments infrastructure or integrate Stripe?",
];

export default function CouncilForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [councilType, setCouncilType] = useState<CouncilType>("startup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CouncilRunResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), councilType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "The council could not be convened.");
      }
      setResult(data as CouncilRunResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ---- Results view ----
  if (result) {
    const persisted = result.id !== "ephemeral";
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Council results</h2>
          <div className="flex gap-2">
            {persisted && (
              <button
                onClick={() => router.push(`/results/${result.id}`)}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Open permalink
              </button>
            )}
            <button
              onClick={() => {
                setResult(null);
                setQuestion("");
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Ask another
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Your question
          </p>
          <p className="mt-1 text-slate-200">{result.question}</p>
        </div>

        <VerdictView verdict={result.verdict} />

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Advisor responses
          </h3>
          <div className="grid gap-5 lg:grid-cols-2">
            {result.seatResponses.map((r) => (
              <SeatCard key={r.seat} response={r} />
            ))}
          </div>
        </div>

        {!persisted && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Supabase isn&apos;t configured, so this result was not saved. Add your
            Supabase keys to enable history.
          </p>
        )}
      </div>
    );
  }

  // ---- Form view ----
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="question"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          Your business question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="e.g. Should we expand into the EU market before reaching profitability?"
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          disabled={loading}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuestion(ex)}
              disabled={loading}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-brand-500/40 hover:text-slate-200 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-200">
          Council type
        </span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COUNCIL_TYPES.map((type) => {
            const active = councilType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setCouncilType(type.value)}
                disabled={loading}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-brand-500 bg-brand-600/15"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="block font-semibold text-white">
                  {type.label}
                </span>
                <span className="mt-1 block text-sm text-slate-400">
                  {type.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Council in session…" : "Convene the council"}
        </button>
        {loading && (
          <span className="text-sm text-slate-400">
            Consulting four advisors and the Chairman — this can take up to a
            minute.
          </span>
        )}
      </div>
    </form>
  );
}
