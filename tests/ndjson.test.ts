import { describe, it, expect } from "vitest";
import { readNdjsonStream } from "@/lib/ndjson";

/** Builds a Response whose body streams `chunks` sequentially. */
function streamingResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body);
}

describe("readNdjsonStream", () => {
  it("yields one parsed object per line", async () => {
    const res = streamingResponse(['{"a":1}\n', '{"b":2}\n']);
    const out: unknown[] = [];
    for await (const obj of readNdjsonStream(res)) out.push(obj);
    expect(out).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("reassembles objects split across chunks", async () => {
    const res = streamingResponse(['{"a":', '1}\n{"b":2', "}\n"]);
    const out: unknown[] = [];
    for await (const obj of readNdjsonStream(res)) out.push(obj);
    expect(out).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("flushes a trailing line without a newline", async () => {
    const res = streamingResponse(['{"a":1}']);
    const out: unknown[] = [];
    for await (const obj of readNdjsonStream(res)) out.push(obj);
    expect(out).toEqual([{ a: 1 }]);
  });
});
