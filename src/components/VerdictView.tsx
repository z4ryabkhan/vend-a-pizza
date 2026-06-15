import type { ChairmanVerdict } from "@/lib/types";
import DecisionBadge from "./DecisionBadge";
import ConfidenceMeter from "./ConfidenceMeter";

function ListSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-300">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function VerdictView({ verdict }: { verdict: ChairmanVerdict }) {
  return (
    <div className="space-y-5">
      {/* Headline verdict */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/20 to-brand-900/10 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Chairman Verdict</h2>
          <DecisionBadge decision={verdict.finalDecision} />
        </div>
        <p className="mb-5 leading-relaxed text-slate-200">
          {verdict.executiveSummary}
        </p>
        <ConfidenceMeter score={verdict.confidenceScore} />
      </div>

      {/* Best recommendation */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-300">
          Best Recommendation
        </h3>
        <p className="leading-relaxed text-slate-200">
          {verdict.bestRecommendation}
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <ListSection
          title="Key Risks"
          items={verdict.keyRisks}
          emptyText="No major risks identified."
        />
        <ListSection
          title="Financial Considerations"
          items={verdict.financialConsiderations}
          emptyText="No financial considerations noted."
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-300">
          Action Plan
        </h3>
        {verdict.actionPlan.length === 0 ? (
          <p className="text-sm text-slate-500">No action plan was produced.</p>
        ) : (
          <ol className="space-y-3">
            {verdict.actionPlan.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
