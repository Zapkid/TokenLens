import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arbFixture } from "@/lib/arb/live";
import { SEL } from "@/lib/selectors";
import { ArbPage } from "../ArbPage";

const byId = (id: string) => screen.getByTestId(id);

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("ArbPage (TL-113)", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", RO);
    window.localStorage.clear();
    window.history.replaceState(null, "", "/arb");
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("defaults to English LTR and switches to Hebrew RTL, persisting the choice", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    const root = byId(SEL.arbRoot);
    expect(root).toHaveAttribute("dir", "ltr");
    expect(root).toHaveAttribute("lang", "en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Blockchain Expert final project");

    fireEvent.click(byId(SEL.arbLangToggle));
    expect(root).toHaveAttribute("dir", "rtl");
    expect(root).toHaveAttribute("lang", "he");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("פרויקט גמר");
    expect(window.localStorage.getItem("tokenlens:v1:arb-lang")).toBe("he");
    expect(window.location.search).toBe("?lang=he");

    fireEvent.click(byId(SEL.arbLangToggle));
    expect(root).toHaveAttribute("dir", "ltr");
    expect(window.location.search).toBe("");
  });

  it("honors ?lang=he on load", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    window.history.replaceState(null, "", "/arb?lang=he");
    render(<ArbPage />);
    await waitFor(() => expect(byId(SEL.arbRoot)).toHaveAttribute("dir", "rtl"));
  });

  it("renders every course question", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    expect(screen.getAllByTestId(SEL.arbQuestion)).toHaveLength(29);
  });

  it("shows live tiles with a check time when /api/arb answers", async () => {
    const data = arbFixture();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => data })),
    );
    render(<ArbPage />);
    await waitFor(() => expect(byId(SEL.arbLiveStatus)).toHaveAttribute("data-status", "ready"));
    expect(byId(SEL.arbLiveStatus)).toHaveTextContent("Checked 1 Nov 2026");
    expect(screen.getAllByTestId(SEL.arbLiveTile).length).toBeGreaterThan(8);
  });

  it("keeps static answers when live data fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 502, json: async () => ({}) })));
    await act(async () => {
      render(<ArbPage />);
    });
    await waitFor(() => expect(byId(SEL.arbLiveStatus)).toHaveAttribute("data-status", "error"));
    expect(screen.getAllByTestId(SEL.arbQuestion)).toHaveLength(29);
    expect(screen.queryAllByTestId(SEL.arbLiveTile)).toHaveLength(0);
  });
});
