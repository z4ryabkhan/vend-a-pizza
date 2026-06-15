const SEAT_META: Record<string, { emoji: string; role: string }> = {
  strategist: { emoji: "♟️", role: "Strategist" },
  risk: { emoji: "🛡️", role: "Risk Analyst" },
  researcher: { emoji: "🔬", role: "Researcher" },
  builder: { emoji: "🛠️", role: "Technical Builder" },
};

/** Placeholder shown while an advisor is still thinking. */
export default function SeatSkeleton({ seat }: { seat: string }) {
  const meta = SEAT_META[seat] ?? { emoji: "🤖", role: "Advisor" };
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl opacity-60" aria-hidden>
            {meta.emoji}
          </span>
          <div>
            <h3 className="font-semibold text-white/80">{meta.role}</h3>
            <p className="flex items-center gap-1.5 text-xs text-brand-300">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-400/40 border-t-brand-300" />
              thinking…
            </p>
          </div>
        </div>
      </header>
      <div className="space-y-2.5 px-5 pb-5">
        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
      </div>
    </article>
  );
}
