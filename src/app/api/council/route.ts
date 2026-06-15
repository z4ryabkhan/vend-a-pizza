// POST /api/council — runs a council session and streams progress as
// newline-delimited JSON (see CouncilStreamEvent). Each advisor is emitted as
// it resolves, then the Chairman verdict, then the saved row id.
//
// Body: { question: string, councilType: CouncilType }

import { NextResponse } from "next/server";
import { runSeats, hasUsableResponses } from "@/lib/runCouncil";
import { runChairman } from "@/lib/chairman";
import { councilTypeLabel } from "@/lib/council";
import { insertCouncilSession } from "@/lib/db";
import {
  isServerSupabaseConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase/server";
import { validateCouncilInput } from "@/lib/validation";
import type { CouncilStreamEvent } from "@/lib/types";

// Council runs call several models in series; give it room to breathe.
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = validateCouncilInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  // When Supabase is configured, require an authenticated user (the app's
  // pages are gated by middleware; this guards the API directly too).
  let userId: string | null = null;
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to convene a council." },
        { status: 401 }
      );
    }
    userId = user.id;
  }

  const { question, councilType } = input;
  const typeLabel = councilTypeLabel(councilType);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: CouncilStreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        send({ type: "status", stage: "advisors" });

        const seatResponses = await runSeats(question, typeLabel, {
          signal: request.signal,
          onSeat: (r) => send({ type: "seat", data: r }),
        });

        if (!hasUsableResponses(seatResponses)) {
          send({
            type: "error",
            error:
              "All council advisors failed. Check your OPENROUTER_API_KEY and " +
              "model access.",
          });
          controller.close();
          return;
        }

        send({ type: "status", stage: "chairman" });
        const verdict = await runChairman(
          question,
          typeLabel,
          seatResponses,
          request.signal
        );
        send({ type: "verdict", data: verdict });

        // Persist when possible; otherwise return an ephemeral result.
        let id = "ephemeral";
        let createdAt = new Date().toISOString();
        let persisted = false;
        if (isServerSupabaseConfigured()) {
          try {
            const saved = await insertCouncilSession({
              question,
              councilType,
              seatResponses,
              verdict,
              userId,
            });
            id = saved.id;
            createdAt = saved.created_at;
            persisted = true;
          } catch (err) {
            // Don't fail the whole run if only the save fails.
            send({
              type: "error",
              error:
                "Council completed but saving failed: " +
                (err instanceof Error ? err.message : "unknown error"),
            });
          }
        }

        send({ type: "saved", id, createdAt, persisted });
        controller.close();
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Unknown error.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
