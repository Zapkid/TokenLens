import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ResearchChecklist } from "../ResearchChecklist";
import { SEL } from "@/lib/selectors";
import type { Metric, Report } from "@/lib/types";

function metric(key: string, value: number | null): Metric {
  return {
    key,
    label: key,
    family: "development",
    value,
    format: "number",
    direction: "higher",
    percentile: null,
  };
}

const REPORT = {
  asset: { id: "bitcoin", type: "token", name: "Bitcoin", symbol: "BTC" },
  metrics: [metric("commits4w", 300)],
} as unknown as Report;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("ResearchChecklist", () => {
  it("renders the summary strip with the gate locked and auto suggestions counted", () => {
    render(<ResearchChecklist report={REPORT} />);
    // commits4w=300 suggests a 5, so one answer exists before any clicks.
    expect(screen.getByTestId(SEL.researchCompletion).textContent).toContain("1 /");
    expect(screen.getByTestId(SEL.researchOverall).textContent).toContain("5 / 5");
    expect(screen.getByTestId(SEL.researchGate).textContent).toContain(
      "Score more of stage 1",
    );
  });

  it("persists a manual score to localStorage and updates the rollup", () => {
    render(<ResearchChecklist report={REPORT} />);
    fireEvent.click(screen.getByTestId(`${SEL.researchScore}-goals-3`));

    expect(screen.getByTestId(SEL.researchCompletion).textContent).toContain("2 /");
    // Sections average: commits section 5, project section 3 -> overall 4.
    expect(screen.getByTestId(SEL.researchOverall).textContent).toContain("4 / 5");

    const raw = window.localStorage.getItem("tokenlens:v1:research");
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!);
    expect(stored["token:bitcoin"].answers.goals.score).toBe(3);
  });

  it("clears a manual score when the same button is clicked again", () => {
    render(<ResearchChecklist report={REPORT} />);
    const btn = screen.getByTestId(`${SEL.researchScore}-goals-3`);
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    const stored = JSON.parse(window.localStorage.getItem("tokenlens:v1:research")!);
    expect(stored["token:bitcoin"].answers.goals).toBeUndefined();
  });

  it("stores notes alongside scores", () => {
    render(<ResearchChecklist report={REPORT} />);
    fireEvent.change(screen.getByTestId(`${SEL.researchNote}-founders`), {
      target: { value: "doxxed, ex payments" },
    });
    const stored = JSON.parse(window.localStorage.getItem("tokenlens:v1:research")!);
    expect(stored["token:bitcoin"].answers.founders.note).toBe("doxxed, ex payments");
  });

  it("shows the auto answer with its basis and a dashed suggested button", () => {
    render(<ResearchChecklist report={REPORT} />);
    const auto = screen.getByTestId(`${SEL.researchAuto}-commitActivity`);
    expect(auto.textContent).toContain("300 commits in 4 weeks");
    expect(auto.textContent).toContain("CoinGecko developer data");
    const suggested = screen.getByTestId(`${SEL.researchScore}-commitActivity-5`);
    expect(suggested.className).toContain("border-dashed");
  });
});
