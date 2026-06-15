import type { FinalDecision } from "@/lib/types";

const STYLES: Record<FinalDecision, string> = {
  Proceed: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Pause: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Reject: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export default function DecisionBadge({
  decision,
  className = "",
}: {
  decision: FinalDecision;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STYLES[decision]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {decision}
    </span>
  );
}
