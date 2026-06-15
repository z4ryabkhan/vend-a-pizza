"use client";

import { useState } from "react";
import { sessionToMarkdown } from "@/lib/markdown";
import type { CouncilSession } from "@/lib/types";

export default function ExportVerdictButton({
  session,
}: {
  session: CouncilSession;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const md = sessionToMarkdown(session);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — fall back to a download.
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `council-${session.id}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {copied ? "Copied ✓" : "Copy as Markdown"}
    </button>
  );
}
