export default function ConfidenceMeter({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70
      ? "bg-emerald-500"
      : clamped >= 40
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">Chairman confidence</span>
        <span className="font-semibold text-white">{clamped}/100</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
