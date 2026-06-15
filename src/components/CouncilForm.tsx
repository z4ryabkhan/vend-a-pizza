"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNCIL_TYPES } from "@/lib/council";
import { readNdjsonStream } from "@/lib/ndjson";
import type {
  ChairmanVerdict,
  CouncilStreamEvent,
  CouncilType,
  SeatId,
  SeatResponse,
} from "@/lib/types";
import VerdictView from "./VerdictView";
import SeatCard from "./SeatCard";
import SeatSkeleton from "./SeatSkeleton";

const EXAMPLES = [
  "Should we pivot our B2B SaaS to a self-serve PLG model next quarter?",
  "Is now the right time to raise a seed round, or should we bootstrap further?",
  "Should we build our own payments infrastructure or integrate Stripe?",
];

const SEAT_ORDER: SeatId[] = ["strategist", "risk", "researcher", "builder"];

type Stage = "idle" | "advisors" | "chairman" | "done";

export default function CouncilForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [councilType, setCouncilType] = useState<CouncilType>("startup");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const [seats, setSeats] = useState<Record<string, SeatResponse>>({});
  const [verdict, setVerdict] = useState<ChairmanVerdict | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const loading = stage === "advisors" || stage === "chairman";

  function reset() {
    setStage("idle");
    setError(null);
    setSeats({});
    setVerdict(null);
    setSavedId(null);
    setPersisted(false);
    setQuestion("");
    setSubmittedQuestion("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setError(null);
    setSeats({});
    setVerdict(null);
    setSavedId(null);
    setPersisted(false);
    setSubmittedQuestion(trimmed);
    setStage("advisors");

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, councilType }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "The council could not be convened.");
      }

      for await (const event of readNdjsonStream<CouncilStreamEvent>(res)) {
        switch (event.type) {
          case "status":
            setStage(event.stage);
            break;
          case "seat":
            setSeats((prev) => ({ ...prev, [event.data.seat]: event.data }));
            break;
          case "verdict":
            setVerdict(event.data);
            break;
          case "saved":
            setSavedId(event.id);
            setPersisted(event.persisted);
            setStage("done");
            break;
          case "error":
            setError(event.error);
            break;
        }
      }
      setStage((s) => (s === "done" ? s : "done"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    }
  }

  const showResults = stage !== "idle";

  if (showResults) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">
            {stage === "done" ? "Council results" : "Council in session…"}
          </h2>
          <div className="flex gap-2">
            {stage === "done" && persisted && savedId && (
              <button
                onClick={() => router.push(`/results/${savedId}`)}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Open permalink
              </button>
            )}
            {stage === "done" && (
              <button
                onClick={reset}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                Ask another
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Your question
          </p>
          <p className="mt-1 text-slate-200">{submittedQuestion}</p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {/* Advisors stream in first */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              Advisor responses
            </h3>
            {stage === "advisors" && (
              <span className="text-sm text-slate-400">
                consulting the council…
              </span>
            )}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {SEAT_ORDER.map((id) =>
              seats[id] ? (
                <SeatCard key={id} response={seats[id]} />
              ) : (
                <SeatSkeleton key={id} seat={id} />
              )
            )}
          </div>
        </div>

        {/* Chairman verdict */}
        {verdict ? (
          <VerdictView verdict={verdict} />
        ) : stage === "chairman" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-600/10 px-5 py-6 text-slate-200">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-400/40 border-t-brand-300" />
            The Chairman is synthesizing the final verdict…
          </div>
        ) : null}

        {stage === "done" && verdict && !persisted && (
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
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuestion(ex)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-brand-500/40 hover:text-slate-200"
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

      <button
        type="submit"
        disabled={!question.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Convene the council
      </button>
    </form>
  );
}
