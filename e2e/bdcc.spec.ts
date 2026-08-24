import { expect, test } from "@playwright/test";
import { SEL } from "../lib/selectors";

const t = (id: string) => `[data-testid="${id}"]`;

test.describe("BDCC landing page", () => {
  test("TL-076 /bdcc renders the RTL Hebrew landing with logo and hero", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const root = page.locator(t(SEL.bdccRoot));
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("dir", "rtl");
    await expect(page.locator(t(SEL.bdccLogo))).toContainText("BDCC");
    await expect(page.locator(t(SEL.bdccHero))).toBeVisible();
    await expect(page.locator(t(SEL.bdccCtaCourses))).toHaveAttribute(
      "href",
      "https://www.bdcc.co.il/courses",
    );
  });

  test("TL-077 three course cards link to the official bdcc.co.il site", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const cards = page.locator(t(SEL.bdccCourseCard));
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const href = await cards.nth(i).getAttribute("href");
      expect(href).toMatch(/^https:\/\/www\.bdcc\.co\.il\//);
      await expect(cards.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });

  test("TL-078 contact block exposes normalized tel and mailto links", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const contact = page.locator(t(SEL.bdccContact));
    await expect(contact).toBeVisible();
    await expect(
      contact.locator('a[href="tel:+972552828741"]'),
    ).toBeVisible();
    await expect(
      contact.locator('a[href="mailto:support@bdcc.co.il"]'),
    ).toBeVisible();
  });
});
