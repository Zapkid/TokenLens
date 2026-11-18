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
    expect(byId(SEL.arbLivePanel)).toHaveTextContent("Checked 18 Nov 2026");
    expect(screen.getAllByTestId(SEL.arbLiveTile).length).toBeGreaterThan(8);
    expect(byId(SEL.arbChainsTable)).toHaveTextContent("Robinhood Chain");
    expect(byId(SEL.arbChainsTable)).toHaveTextContent("Stage 0");
    const checks = screen.getAllByTestId(SEL.arbQualityCheck);
    expect(checks.length).toBeGreaterThanOrEqual(10);
    expect(checks.filter((c) => c.getAttribute("data-status") === "fail")).toHaveLength(0);
  });

  it("filters the history explorer by category and marks the 2.1 events", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    const all = screen.getAllByTestId(SEL.arbHistoryEvent).length;
    expect(all).toBeGreaterThanOrEqual(20);
    const security = screen.getAllByTestId(SEL.arbHistoryFilter).find((b) => b.getAttribute("data-category") === "security")!;
    fireEvent.click(security);
    expect(security).toHaveAttribute("aria-pressed", "true");
    const shown = screen.getAllByTestId(SEL.arbHistoryEvent);
    expect(shown.length).toBeLessThan(all);
    expect(shown.every((e) => e.getAttribute("data-category") === "security")).toBe(true);
  });

  it("shows the roadmap in four statuses", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    const statuses = new Set(screen.getAllByTestId(SEL.arbRoadmapItem).map((e) => e.getAttribute("data-status")));
    expect(statuses).toEqual(new Set(["done", "voting", "next", "longterm"]));
  });

  it("searches the glossary and reveals practice answers on demand", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    fireEvent.change(byId(SEL.arbGlossarySearch), { target: { value: "BoLD" } });
    const terms = screen.getAllByTestId(SEL.arbGlossaryTerm);
    expect(terms.length).toBeGreaterThan(0);
    expect(terms.every((t) => /bold/i.test(t.textContent ?? ""))).toBe(true);

    const reveal = screen.getAllByTestId(SEL.arbPracticeReveal)[0];
    expect(reveal).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(reveal);
    expect(reveal).toHaveAttribute("aria-expanded", "true");
  });

  it("tracks plan progress and persists it in the app storage namespace", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ArbPage />);
    const steps = screen.getAllByTestId(SEL.arbPlanStep);
    expect(byId(SEL.arbPlanProgress)).toHaveTextContent(`0 / ${steps.length}`);
    fireEvent.click(steps[0]);
    expect(byId(SEL.arbPlanProgress)).toHaveTextContent(`1 / ${steps.length}`);
    expect(JSON.parse(window.localStorage.getItem("tokenlens:v1:arb-steps") ?? "[]")).toHaveLength(1);
    cleanup();
    render(<ArbPage />);
    await waitFor(() => expect(byId(SEL.arbPlanProgress)).toHaveTextContent(`1 / ${steps.length}`));
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
