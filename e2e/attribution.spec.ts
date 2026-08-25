import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("Data attribution", () => {
  test("TL-087 footer credits CoinGecko with logo and link, plus DeFiLlama and alternative.me", async ({
    page,
  }) => {
    await page.goto("/");
    const cg = page.locator(t(SEL.attributionCoinGecko));
    await cg.scrollIntoViewIfNeeded();
    await expect(cg).toBeVisible();
    await expect(cg).toHaveAttribute("href", "https://www.coingecko.com");
    await expect(cg.locator("svg")).toHaveCount(1);
    await expect(cg).toContainText("CoinGecko");
    await expect(
      page.locator('footer a[href="https://defillama.com"]'),
    ).toBeVisible();
    await expect(
      page.locator(
        'footer a[href="https://alternative.me/crypto/fear-and-greed-index/"]',
      ),
    ).toBeVisible();
  });
});
