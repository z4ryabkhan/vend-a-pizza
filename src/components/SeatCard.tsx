import type { SeatId, SeatResponse } from "@/lib/types";

const SEAT_META: Record<SeatId, { emoji: string; accent: string }> = {
  strategist: { emoji: "♟️", accent: "from-indigo-500/20 to-indigo-500/5" },
  risk: { emoji: "🛡️", accent: "from-rose-500/20 to-rose-500/5" },
  researcher: { emoji: "🔬", accent: "from-sky-500/20 to-sky-500/5" },
  builder: { emoji: "🛠️", accent: "from-emerald-500/20 to-emerald-500/5" },
};

export default function SeatCard({ response }: { response: SeatResponse }) {
  const meta = SEAT_META[response.seat];
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <header
        className={`flex items-center justify-between bg-gradient-to-r ${meta.accent} px-5 py-4`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {meta.emoji}
          </span>
          <div>
            <h3 className="font-semibold text-white">{response.role}</h3>
            <p className="font-mono text-xs text-slate-400">{response.model}</p>
          </div>
        </div>
      </header>
      <div className="px-5 py-4">
        {response.error ? (
          <p className="text-sm text-rose-300">
            This advisor was unavailable: {response.error}
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {response.content}
          </p>
        )}
      </div>
    </article>
  );
}
