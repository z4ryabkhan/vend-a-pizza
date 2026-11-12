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
  "Should I open a second Waves car wash before this site hits £30k/month revenue?",
  "Is it time to franchise Paratha Stop Leeds, or should I optimise the single site first?",
  "Should I build an AI lead gen SaaS or offer it as a done-for-you agency service?",
  "I've found a business for sale at 3× EBITDA — is this a good acquisition target?",
  "Should I use my cash reserves to buy a buy-to-let or reinvest in my existing businesses?",
];

const SEAT_ORDER: SeatId[] = ["strategist", "risk", "researcher", "builder"];

type Stage = "idle" | "advisors" | "chairman" | "done";

export default function CouncilForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [councilType, setCouncilType] = useState<CouncilType>("carwash");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [seats, setSeats] = useState<Record<string, SeatResponse>>({});
  const [verdict, setVerdict] = useState<ChairmanVerdict | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const loading = stage === "advisors" || stage === "chairman";

  function reset() {
    setStage("idle");
    setError(null);
    setLimitReached(false);
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.error === "limit_reached") {
          setLimitReached(true);
          setStage("idle");
          return;
        }
        throw new Error(data.error || "The council could not be convened.");
      }

      if (!res.body) {
        throw new Error("The council could not be convened.");
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
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-white">
            {stage === "done" ? "Council results" : "Council in session…"}
          </h2>
          {stage === "done" && (
            <div className="flex gap-2">
              {persisted && savedId && (
                <button
                  onClick={() => router.push(`/results/${savedId}`)}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:flex-none sm:py-2"
                >
                  Open permalink
                </button>
              )}
              <button
                onClick={reset}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 sm:flex-none sm:py-2"
              >
                Ask another
              </button>
            </div>
          )}
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
      {limitReached && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
          <p className="text-sm text-amber-200">
            You&apos;ve used all your councils this month. Upgrade to continue.
          </p>
          <a
            href="/pricing"
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Upgrade plan
          </a>
        </div>
      )}
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
          rows={4}
          maxLength={4000}
          placeholder="e.g. Should I open a second Waves car wash site before this one hits £30k/month?"
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        {/* Example chips — horizontally scrollable on mobile */}
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuestion(ex)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-brand-500/40 hover:text-slate-200 sm:shrink"
            >
              <span className="line-clamp-1 max-w-[200px] sm:max-w-none">
                {ex}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-200">
          Council type
        </span>
        {/* Council type — 2-col grid on mobile, 3-col on desktop */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
          {COUNCIL_TYPES.map((type) => {
            const active = councilType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setCouncilType(type.value)}
                className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                  active
                    ? "border-brand-500 bg-brand-600/15"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="block text-sm font-semibold text-white sm:text-base">
                  {type.label}
                </span>
                <span className="mt-1 hidden text-xs leading-snug text-slate-400 sm:block sm:text-sm">
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-3"
      >
        Convene the council
      </button>
    </form>
  );
}
