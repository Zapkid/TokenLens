import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Token report", () => {
  test("TL-010 renders every section with scores, grade, and quadrant", async ({
    page,
  }) => {
    await page.goto("/report/token/solana");
    await expect(page.locator(t(SEL.reportTitle))).toContainText("Solana");
    for (const sel of [
      SEL.sectionOverview,
      SEL.sectionStats,
      SEL.sectionRisk,
      SEL.sectionPotential,
      SEL.sectionTrajectory,
      SEL.sectionEvents,
      SEL.sectionStrategy,
    ]) {
      await expect(page.locator(t(sel))).toBeVisible();
    }
    await expect(page.locator(t(SEL.scoreOpportunity))).toHaveText(/^\d+(\.\d+)?$/);
    await expect(page.locator(t(SEL.scoreRisk))).toHaveText(/^\d+(\.\d+)?$/);
    await expect(page.locator(t(SEL.riskGrade))).toContainText(/Risk grade [A-E]/);
    await expect(page.locator(t(SEL.quadrantChart))).toBeVisible();
    // Fixture mode must label itself so synthetic data is never mistaken for market data.
    await expect(page.locator(t(SEL.fixtureBadge))).toBeVisible();
  });

  test("TL-011 trajectory horizon switching updates the fan chart", async ({ page }) => {
    await page.goto("/report/token/bitcoin");
    await expect(page.locator(t(SEL.fanChart)).first()).toBeVisible();
    const before = await page
      .locator(t(SEL.sectionTrajectory))
      .locator("table tbody tr")
      .first()
      .innerText();
    await page.locator(t(`${SEL.trajectoryHorizon}-12`)).first().click();
    const after = await page
      .locator(t(SEL.sectionTrajectory))
      .locator("table tbody tr")
      .first()
      .innerText();
    expect(after).not.toBe(before);
  });

  test("TL-012 watchlist toggle persists and surfaces on the home page", async ({
    page,
  }) => {
    await page.goto("/report/token/chainlink");
    await page.locator(t(SEL.watchlistToggle)).click();
    await expect(page.locator(t(SEL.watchlistToggle))).toContainText("Watching");
    await page.goto("/");
    await expect(page.locator(t(SEL.watchlistSection))).toContainText("LINK");
  });
});

test.describe("Chain report", () => {
  test("TL-020 includes the network section and both trajectories", async ({ page }) => {
    await page.goto("/report/chain/solana");
    await expect(page.locator(t(SEL.sectionNetwork))).toBeVisible();
    await expect(page.locator(t(SEL.sectionNetwork))).toContainText("Top protocols");
    await expect(page.locator(t(SEL.sectionTrajectory))).toContainText(
      "TVL growth trajectory",
    );
    // Nested native token analysis is present.
    await expect(page.locator(t(SEL.sectionStats))).toContainText("Market cap");
  });

  test("TL-021 a chain without a native token omits token analysis with a warning", async ({
    page,
  }) => {
    await page.goto("/report/chain/base");
    await expect(page.locator(t(SEL.sectionNetwork))).toBeVisible();
    await expect(page.locator(t(SEL.sectionOverview))).toContainText(
      "no resolvable native token",
    );
  });

  test("TL-022 unknown assets show a failure card, not a fabricated report", async ({
    page,
  }) => {
    await page.goto("/report/token/not-a-real-asset");
    await expect(page.getByText("Report generation failed")).toBeVisible();
  });
});

test.describe("Settings", () => {
  test("TL-030 weight edits re-score the open report live and reset restores defaults", async ({
    page,
  }) => {
    await page.goto("/report/token/solana");
    await expect(page.locator(t(SEL.reportRoot))).toBeVisible();
    await page.goto("/settings");
    await expect(page.locator(t(SEL.weightsEditor))).toContainText("Solana");
    const preview = () =>
      page.locator(t(SEL.weightsEditor)).getByText(/opportunity \d/).innerText();
    const before = await preview();
    await page
      .locator(t(`${SEL.weightSlider}-opp-fundamentals`))
      .fill("50");
    const after = await preview();
    expect(after).not.toBe(before);
    await page.locator(t(SEL.weightsReset)).click();
    const reset = await preview();
    expect(reset).toBe(before);
  });
});
