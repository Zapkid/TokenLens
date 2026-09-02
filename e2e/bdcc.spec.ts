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
    const hrefs: string[] = [];
    for (let i = 0; i < 3; i++) {
      const href = await cards.nth(i).getAttribute("href");
      expect(href).toMatch(/^https:\/\/www\.bdcc\.co\.il\//);
      await expect(cards.nth(i)).toHaveAttribute("rel", /noopener/);
      if (href) hrefs.push(href);
    }
    expect(hrefs).toContain(
      "https://www.bdcc.co.il/blockchain-expert-course",
    );
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

  test("TL-085 media and scarcity: vimeo embed, six gallery images, cohort strip", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    await expect(page.locator(t(SEL.bdccAnnouncement))).toBeVisible();
    const iframe = page.locator(`${t(SEL.bdccVideo)} iframe`);
    await expect(iframe).toHaveAttribute(
      "src",
      /player\.vimeo\.com\/video\/1016720884/,
    );
    await expect(page.locator(`${t(SEL.bdccGallery)} img`)).toHaveCount(6);
    // Served through the Next image optimizer on our own domain, with the
    // CDN origin encoded in the url param.
    const firstSrc = await page
      .locator(`${t(SEL.bdccGallery)} img`)
      .first()
      .getAttribute("src");
    expect(firstSrc).toContain("/_next/image");
    expect(firstSrc).toContain("lwfiles.mycourse.app");
    const cohorts = page.locator(t(SEL.bdccCohorts));
    await expect(cohorts.getByText("תפוסה מלאה")).toHaveCount(2);
    await expect(cohorts.getByText("מקומות בודדים")).toBeVisible();
    await expect(cohorts.getByText("הרשם עכשיו!!")).toHaveCount(1);
  });

  test("TL-086 lead form validates, then prepares a mailto draft to the team", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    // Clear the consent banner (always shown on a fresh e2e context) so it
    // cannot overlay the form controls.
    await page.locator(t(SEL.bdccConsentDecline)).click();
    const form = page.locator(t(SEL.bdccLeadForm));
    await form.scrollIntoViewIfNeeded();
    await form.locator(t(SEL.bdccLeadSubmit)).click();
    await expect(form.locator(t(SEL.bdccLeadError))).toBeVisible();
    await form.getByPlaceholder("שם מלא").fill("ישראל ישראלי");
    await form.getByPlaceholder("טלפון").fill("055-282-8741");
    await form.getByPlaceholder("מייל").fill("lead@example.com");
    await form.getByRole("radio").first().check();
    await form.getByRole("checkbox").check();
    await form.locator(t(SEL.bdccLeadSubmit)).click();
    const success = form.locator(t(SEL.bdccLeadSuccess));
    await expect(success).toBeVisible();
    const draft = await success.locator("a").getAttribute("href");
    expect(draft).toContain("mailto:support@bdcc.co.il");
    expect(draft).toContain(encodeURIComponent("ישראל ישראלי"));
  });

  test("TL-084 landing fills the viewport width on desktop without the app shell", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/bdcc");
    const { rootWidth, clientWidth } = await page.evaluate(() => ({
      rootWidth: document
        .querySelector('[data-testid="bdcc-root"]')!
        .getBoundingClientRect().width,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(clientWidth).toBeGreaterThan(1500);
    expect(Math.abs(rootWidth - clientWidth)).toBeLessThanOrEqual(1);
    await expect(page.locator(t(SEL.navHome))).toHaveCount(0);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("TL-091 consent banner: no third-party script before a choice, tags only after accept", async ({
    page,
  }) => {
    await page.goto("/bdcc");
    const banner = page.locator(t(SEL.bdccConsent));
    await expect(banner).toBeVisible();
    // Nothing from Google is on the page (no bootstrap, no dataLayer) and
    // the banner links to the privacy notice.
    const before = await page.evaluate(() => ({
      scripts: [...document.querySelectorAll("script[src]")].map((s) =>
        (s as HTMLScriptElement).src,
      ),
      hasLayer: "dataLayer" in window,
      hasGtag: typeof (window as unknown as { gtag?: unknown }).gtag,
    }));
    expect(before.scripts.some((s) => s.includes("googletagmanager"))).toBe(false);
    expect(before.hasLayer).toBe(false);
    expect(before.hasGtag).toBe("undefined");
    await expect(page.locator(t(SEL.bdccConsentPrivacy))).toHaveAttribute(
      "href",
      "/privacy",
    );
    await page.locator(t(SEL.bdccConsentAccept)).click();
    await expect(banner).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.querySelectorAll("script[src]")].some((s) =>
            (s as HTMLScriptElement).src.includes("googletagmanager.com/gtag/js"),
          ),
        ),
      )
      .toBe(true);
    const state = await page.evaluate(() => ({
      stored: JSON.parse(localStorage.getItem("bdcc-ad-consent") ?? "null"),
      layer: JSON.stringify(
        (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [],
      ),
    }));
    expect(state.stored.choice).toBe("granted");
    expect(typeof state.stored.at).toBe("string");
    expect(state.stored.version).toBeGreaterThanOrEqual(2);
    expect(state.layer).toContain("granted");
    expect(state.layer).not.toContain("denied");
    await page.reload();
    await expect(page.locator(t(SEL.bdccConsent))).toHaveCount(0);
  });

  test("TL-092 SEO surface: metadata, structured data, robots, and sitemap", async ({
    page,
    request,
  }) => {
    await page.goto("/bdcc");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /BDCC/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/bdcc$/,
    );
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(ld).toContain("EducationalOrganization");
    expect(ld).toContain("blockchain-expert-course");
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/bdcc");
  });

  test("TL-093 /bdcc2 renders the isometric variant with the same content and funnel", async ({
    page,
  }) => {
    await page.goto("/bdcc2");
    const root = page.locator(t(SEL.bdccRoot));
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("dir", "rtl");
    await expect(page.locator(t(SEL.bdccHero))).toContainText(
      "לומדים קריפטו נכון",
    );
    const cards = page.locator(t(SEL.bdccCourseCard));
    await expect(cards).toHaveCount(3);
    const hrefs = await cards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")),
    );
    expect(hrefs).toContain(
      "https://www.bdcc.co.il/blockchain-expert-course",
    );
    await expect(
      page.locator(t(SEL.bdccCohorts)).getByText("הרשם עכשיו!!"),
    ).toHaveCount(1);
    await expect(page.locator(`${t(SEL.bdccGallery)} img`)).toHaveCount(6);
    await expect(page.locator(t(SEL.bdccLeadForm))).toBeAttached();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/bdcc2$/,
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
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
