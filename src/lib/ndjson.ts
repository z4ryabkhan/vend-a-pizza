// Minimal newline-delimited-JSON stream reader. Yields one parsed object per
// line as it arrives, buffering partial lines across chunks.

export async function* readNdjsonStream<T>(
  response: Response
): AsyncGenerator<T> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) yield JSON.parse(line) as T;
    }
  }

  // Flush any trailing line without a newline terminator.
  buffer += decoder.decode();
  const last = buffer.trim();
  if (last) yield JSON.parse(last) as T;
}
