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

  test("TL-080 course cards track the cursor with glow and tilt variables", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const card = page.locator(t(SEL.bdccCourseCard)).first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(card).toHaveAttribute("style", /--mx/);
    await expect(card).toHaveAttribute("style", /--my/);
    await expect(card).toHaveAttribute("style", /--rx/);
  });

  test("TL-081 stats count up to their final values and the marquee loops", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const stats = page.locator(t(SEL.bdccStatValue));
    await stats.first().scrollIntoViewIfNeeded();
    await expect(stats.filter({ hasText: "2017" })).toHaveCount(1);
    await expect(stats.filter({ hasText: /^3$/ })).toHaveCount(1);
    const marquee = page.locator(t(SEL.bdccMarquee));
    await expect(marquee).toBeVisible();
    await expect(marquee.locator('div[aria-hidden="true"]')).toHaveCount(1);
  });

  test("TL-082 hero and wordmark settle to real text after the scramble", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    await expect(page.locator(t(SEL.bdccLogo))).toContainText("BDCC", {
      timeout: 5000,
    });
    await expect(page.locator(t(SEL.bdccHero))).toContainText(
      "לומדים קריפטו נכון.",
      { timeout: 5000 },
    );
  });
});
