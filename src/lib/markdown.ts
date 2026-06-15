// Renders a council session as Markdown for copy/export. Pure & testable.

import type { CouncilSession } from "./types";
import { councilTypeLabel } from "./council";

function bullets(items: string[]): string {
  if (!items.length) return "_None_\n";
  return items.map((i) => `- ${i}`).join("\n") + "\n";
}

function numbered(items: string[]): string {
  if (!items.length) return "_None_\n";
  return items.map((i, idx) => `${idx + 1}. ${i}`).join("\n") + "\n";
}

export function sessionToMarkdown(session: CouncilSession): string {
  const v = session.chairman_response;
  const lines: string[] = [];

  lines.push(`# FounderCouncil AI — Verdict\n`);
  lines.push(`**Question:** ${session.question}\n`);
  lines.push(
    `**Council type:** ${councilTypeLabel(session.council_type)}  `,
    `**Date:** ${new Date(session.created_at).toLocaleString()}\n`
  );

  lines.push(`## Final decision: ${v.finalDecision}`);
  lines.push(`**Confidence:** ${v.confidenceScore}/100\n`);

  lines.push(`## Executive summary\n${v.executiveSummary}\n`);
  lines.push(`## Best recommendation\n${v.bestRecommendation}\n`);
  lines.push(`## Key risks\n${bullets(v.keyRisks)}`);
  lines.push(
    `## Financial considerations\n${bullets(v.financialConsiderations)}`
  );
  lines.push(`## Action plan\n${numbered(v.actionPlan)}`);

  lines.push(`## Advisor responses\n`);
  for (const r of session.model_responses) {
    lines.push(`### ${r.role} (${r.model})`);
    lines.push(r.error ? `_Unavailable: ${r.error}_\n` : `${r.content}\n`);
  }

  return lines.join("\n");
}
