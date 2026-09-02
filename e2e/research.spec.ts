import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Research checklist", () => {
  test("TL-100 renders on a token report with auto answers and a locked gate", async ({
    page,
  }) => {
    await page.goto("/report/token/solana");
    await expect(page.locator(t(SEL.sectionResearch))).toBeVisible();
    // Fixture tokens carry developer data, so the GitHub rows pre-fill.
    const commitAuto = page.locator(t(`${SEL.researchAuto}-commitActivity`));
    await expect(commitAuto).toContainText("commits in 4 weeks");
    // Nothing manual is scored yet: the stage 1 gate stays locked.
    await expect(page.locator(t(SEL.researchGate))).toContainText("gate locked");
  });

  test("TL-101 manual scores update the rollup and persist across reloads", async ({
    page,
  }) => {
    await page.goto("/report/token/bitcoin");
    const section = page.locator(t(`${SEL.researchSection}-project`));
    await section.locator("summary").click();
    await page.locator(t(`${SEL.researchScore}-goals-4`)).click();
    await expect(page.locator(t(`${SEL.researchScore}-goals-4`))).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const completion = await page.locator(t(SEL.researchCompletion)).innerText();

    await page.reload();
    await expect(page.locator(t(`${SEL.researchScore}-goals-4`))).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(t(SEL.researchCompletion))).toHaveText(completion);
  });

  test("TL-102 scoring stage 1 sections unlocks the gate verdict", async ({ page }) => {
    await page.goto("/report/token/chainlink");
    // Score one item in enough stage 1 sections to satisfy the coverage rule.
    const stage1 = [
      ["dryData", "launchDate"],
      ["website", "sitePolish"],
      ["project", "goals"],
      ["team", "founders"],
      ["funding", "raiseType"],
      ["community", "communityEngagement"],
    ] as const;
    for (const [section, item] of stage1) {
      const details = page.locator(t(`${SEL.researchSection}-${section}`));
      await details.locator("summary").click();
      await page.locator(t(`${SEL.researchScore}-${item}-4`)).click();
    }
    await expect(page.locator(t(SEL.researchGate))).toContainText("continue research");

    // Downgrading the scores flips the verdict to stop.
    for (const [, item] of stage1) {
      await page.locator(t(`${SEL.researchScore}-${item}-1`)).click();
    }
    await expect(page.locator(t(SEL.researchGate))).toContainText("stop here");
  });

  test("TL-103 chain reports pre-fill the network economics rows", async ({ page }) => {
    await page.goto("/report/chain/solana");
    await expect(page.locator(t(SEL.sectionResearch))).toBeVisible();
    await expect(
      page.locator(t(`${SEL.researchAuto}-ecosystemBreadth`)),
    ).toContainText("protocols with TVL");
    await expect(
      page.locator(t(`${SEL.researchAuto}-networkEconomics`)),
    ).toContainText("fees in 24h");
  });
});
