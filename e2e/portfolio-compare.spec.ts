import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Portfolio", () => {
  test("TL-040 add a position, see valuation, tier table, and rebalancing advice", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    await expect(page.locator(t(SEL.portfolioRoot))).toBeVisible();

    // Add a Solana position through the typeahead form.
    const form = page.locator(t(SEL.positionForm));
    await form.locator("#position-asset").fill("solana");
    await form.getByRole("button", { name: /Solana/ }).first().click();
    await form.locator("#position-quantity").fill("10");
    await form.locator("#position-cost-basis").fill("1500");
    await form.getByRole("button", { name: "Add position" }).click();

    const row = page.locator(t(SEL.positionRow)).first();
    await expect(row).toContainText("SOL");
    await expect(row).toContainText("$1,500");
    // Fixture price for SOL is $185, so the value and P/L resolve.
    await expect(row).toContainText("$1,850");

    // One unclassified speculative position: the tier table flags drift.
    await expect(page.locator(t(SEL.tierTable))).toBeVisible();
    await expect(page.locator(t(SEL.rebalanceSuggestions))).toContainText("trim");

    // Positions persist across reloads (localStorage).
    await page.reload();
    await expect(page.locator(t(SEL.positionRow)).first()).toContainText("SOL");

    // Remove restores the empty state.
    await page.locator(t(SEL.positionRow)).first().getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("No positions yet")).toBeVisible();
  });
});

test.describe("Compare", () => {
  test("TL-050 compares two viewed reports with radars and a score table", async ({
    page,
  }) => {
    // Compare works over previously generated reports: view two first.
    await page.goto("/report/token/bitcoin");
    await expect(page.locator(t(SEL.reportRoot))).toBeVisible();
    await page.goto("/report/token/solana");
    await expect(page.locator(t(SEL.reportRoot))).toBeVisible();

    await page.goto("/compare");
    const picker = page.locator(t(SEL.comparePicker));
    await expect(picker).toBeVisible();

    // Recent reports auto-select, so the comparison renders immediately.
    await expect(page.locator(t(SEL.compareRadar))).toBeVisible();
    const root = page.locator(t(SEL.compareRoot));
    await expect(root).toContainText("Opportunity");
    await expect(root).toContainText(/Risk grade [A-E]/);

    // Deselecting below the minimum removes the comparison; reselecting restores it.
    await picker.getByText("Bitcoin", { exact: false }).click();
    await expect(page.locator(t(SEL.compareRadar))).toHaveCount(0);
    await expect(page.getByText("Select at least 2")).toBeVisible();
    await picker.getByText("Bitcoin", { exact: false }).click();
    await expect(page.locator(t(SEL.compareRadar))).toBeVisible();
  });

  test("TL-051 empty shelf explains how to get comparable reports", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.locator(t(SEL.compareRoot))).toContainText(/open/i);
  });
});
