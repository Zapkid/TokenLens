import { describe, expect, it } from "vitest";
import { isChunkError } from "../ChunkReload";

describe("isChunkError", () => {
  it("matches the chunk-load failure shapes browsers produce", () => {
    expect(
      isChunkError(
        "ChunkLoadError: Loading chunk 191 failed.\n(error: https://x/_next/static/chunks/app/bdcc/page-1.js)",
      ),
    ).toBe(true);
    expect(isChunkError("Loading chunk 23 failed")).toBe(true);
    expect(
      isChunkError("Failed to fetch dynamically imported module: https://x/y.js"),
    ).toBe(true);
  });

  it("ignores unrelated runtime errors", () => {
    expect(isChunkError("TypeError: x is undefined")).toBe(false);
    expect(isChunkError("NetworkError when attempting to fetch resource")).toBe(
      false,
    );
    expect(isChunkError("")).toBe(false);
  });
});
