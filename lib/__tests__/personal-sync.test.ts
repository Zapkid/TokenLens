import { describe, expect, it } from "vitest";
import { resolveSyncAction } from "../personal-sync";

describe("resolveSyncAction", () => {
  const older = "2026-07-21T10:00:00.000Z";
  const newer = "2026-07-21T11:00:00.000Z";

  it("pulls when the server document is newer", () => {
    expect(resolveSyncAction(older, newer)).toBe("pull");
  });

  it("pushes when the local document is newer", () => {
    expect(resolveSyncAction(newer, older)).toBe("push");
  });

  it("noops when timestamps match", () => {
    expect(resolveSyncAction(newer, newer)).toBe("noop");
  });

  it("treats an unparseable local timestamp as never-synced and pulls", () => {
    expect(resolveSyncAction("garbage", newer)).toBe("pull");
  });

  it("pushes when only the server timestamp is unparseable", () => {
    expect(resolveSyncAction(newer, "garbage")).toBe("push");
  });

  it("noops when both timestamps are unparseable", () => {
    expect(resolveSyncAction("garbage", "also-garbage")).toBe("noop");
  });
});
