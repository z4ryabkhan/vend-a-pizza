import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { COUNCIL_SEATS } from "@/lib/council";

const SEAT_EMOJI: Record<string, string> = {
  strategist: "♟️",
  risk: "🛡️",
  researcher: "🔬",
  builder: "🛠️",
};

const STEPS = [
  {
    title: "Ask your question",
    body: "Describe the business decision you're weighing and pick a council type.",
  },
  {
    title: "Four advisors weigh in",
    body: "GPT, Claude, Gemini, and DeepSeek each answer from a distinct expert seat.",
  },
  {
    title: "The Chairman decides",
    body: "A final model synthesizes everything into a verdict with a confidence score.",
  },
];

export default function LandingPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-aurora">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-400" />
            Multi-model AI advisory board
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Five expert minds on every{" "}
            <span className="bg-gradient-to-r from-brand-300 to-fuchsia-400 bg-clip-text text-transparent">
              founder decision
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            FounderCouncil AI sends your business question to four specialized AI
            advisors, then a Chairman model delivers one clear verdict —
            recommendation, risks, financials, action plan, and a go / no-go call.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/council"
              className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:bg-brand-500"
            >
              Convene your council
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Council seats */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">
          Meet your council
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-400">
          Each seat is a different frontier model, prompted to think in its own
          lane.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COUNCIL_SEATS.map((seat) => (
            <div
              key={seat.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-brand-500/40 hover:bg-white/[0.07]"
            >
              <div className="text-3xl">{SEAT_EMOJI[seat.id]}</div>
              <h3 className="mt-4 font-semibold text-white">{seat.role}</h3>
              <p className="mt-1 font-mono text-xs text-brand-300">
                {seat.model}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-white">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/council"
              className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-500"
            >
              Ask your first question
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
