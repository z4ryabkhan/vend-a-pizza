// POST /api/council — runs a full council session and persists it.
// Body: { question: string, councilType: CouncilType }

import { NextResponse } from "next/server";
import { runCouncil } from "@/lib/runCouncil";
import { insertCouncilSession } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { COUNCIL_TYPES } from "@/lib/council";
import type { CouncilRunResult, CouncilType } from "@/lib/types";

// Council runs call several models in series; give it room to breathe.
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(COUNCIL_TYPES.map((t) => t.value));

export async function POST(request: Request) {
  let body: { question?: unknown; councilType?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const councilType = body.councilType as CouncilType;

  if (!question) {
    return NextResponse.json(
      { error: "A business question is required." },
      { status: 400 }
    );
  }
  if (question.length > 4000) {
    return NextResponse.json(
      { error: "Question is too long (max 4000 characters)." },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.has(councilType)) {
    return NextResponse.json(
      { error: "A valid council type is required." },
      { status: 400 }
    );
  }

  try {
    const { seatResponses, verdict } = await runCouncil(question, councilType);

    // Persist when Supabase is configured; otherwise return an ephemeral
    // result so the app still works in a no-database demo setup.
    let id = "ephemeral";
    let createdAt = new Date().toISOString();

    if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const saved = await insertCouncilSession({
        question,
        councilType,
        seatResponses,
        verdict,
      });
      id = saved.id;
      createdAt = saved.created_at;
    }

    const result: CouncilRunResult = {
      id,
      question,
      councilType,
      seatResponses,
      verdict,
      createdAt,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
