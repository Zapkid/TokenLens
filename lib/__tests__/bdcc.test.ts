import { describe, expect, it } from "vitest";
import {
  BDCC_CONTENT,
  BDCC_PALETTE,
  BDCC_SITE_URL,
  bdccUrl,
  buildLeadMailto,
  isValidLead,
  mailHref,
  telHref,
  type BdccLead,
} from "../bdcc";

const validLead: BdccLead = {
  name: "ישראל ישראלי",
  phone: "055-282-8741",
  email: "lead@example.com",
  track: "קורס מסחר",
  consent: true,
};

describe("bdcc link helpers", () => {
  it("bdccUrl joins paths to the official origin", () => {
    expect(bdccUrl("/courses")).toBe("https://www.bdcc.co.il/courses");
    expect(bdccUrl("courses")).toBe("https://www.bdcc.co.il/courses");
    expect(bdccUrl("/course/trading")).toBe(
      "https://www.bdcc.co.il/course/trading",
    );
  });

  it("telHref keeps only digits and a leading plus", () => {
    expect(telHref("+972 55-282-8741")).toBe("tel:+972552828741");
    expect(telHref("055-282-8741")).toBe("tel:0552828741");
    expect(telHref("  +972 (55) 282 8741 ")).toBe("tel:+972552828741");
  });

  it("mailHref builds a trimmed mailto link", () => {
    expect(mailHref(" support@bdcc.co.il ")).toBe(
      "mailto:support@bdcc.co.il",
    );
  });
});

describe("bdcc content model", () => {
  it("ships exactly three course tracks, each linking into the official site", () => {
    expect(BDCC_CONTENT.courses).toHaveLength(3);
    for (const course of BDCC_CONTENT.courses) {
      expect(course.path.startsWith("/")).toBe(true);
      expect(bdccUrl(course.path).startsWith(BDCC_SITE_URL)).toBe(true);
      expect(course.points.length).toBeGreaterThan(0);
    }
  });

  it("isValidLead requires name, phone, email, track, and consent", () => {
    expect(isValidLead(validLead)).toBe(true);
    expect(isValidLead({ ...validLead, name: "א" })).toBe(false);
    expect(isValidLead({ ...validLead, phone: "abc" })).toBe(false);
    expect(isValidLead({ ...validLead, email: "not-an-email" })).toBe(false);
    expect(isValidLead({ ...validLead, track: "" })).toBe(false);
    expect(isValidLead({ ...validLead, consent: false })).toBe(false);
  });

  it("buildLeadMailto targets the team address and encodes the details", () => {
    const href = buildLeadMailto("support@bdcc.co.il", validLead);
    expect(href.startsWith("mailto:support@bdcc.co.il?subject=")).toBe(true);
    expect(href).toContain(encodeURIComponent("ישראל ישראלי"));
    expect(href).toContain(encodeURIComponent("קורס מסחר"));
    expect(href).not.toContain("\n");
  });

  it("contact phone and email produce valid hrefs", () => {
    expect(telHref(BDCC_CONTENT.contact.phone)).toMatch(/^tel:\+\d+$/);
    expect(mailHref(BDCC_CONTENT.contact.email)).toBe(
      "mailto:support@bdcc.co.il",
    );
  });

  it("copy contains no em dashes (repo-wide rule)", () => {
    expect(JSON.stringify(BDCC_CONTENT)).not.toContain("—");
  });

  it("media content is well-formed: vimeo embed and six described gallery images", () => {
    expect(BDCC_CONTENT.video.src).toMatch(
      /^https:\/\/player\.vimeo\.com\/video\/\d+/,
    );
    expect(BDCC_CONTENT.gallery.images).toHaveLength(6);
    for (const image of BDCC_CONTENT.gallery.images) {
      expect(image.src).toMatch(/^https:\/\/lwfiles\.mycourse\.app\//);
      expect(image.alt.length).toBeGreaterThan(5);
    }
  });

  it("the Blockchain Expert funnel links point at the dedicated course page", () => {
    const expert = BDCC_CONTENT.courses.find((c) => c.id === "expert");
    expect(expert?.path).toBe("/blockchain-expert-course");
    expect(BDCC_CONTENT.cohorts.path).toBe("/blockchain-expert-course");
    expect(BDCC_CONTENT.announcement.path).toBe("/blockchain-expert-course");
  });

  it("cohort scarcity has exactly one few-spots cycle and a sensible mix", () => {
    const statuses = BDCC_CONTENT.cohorts.items.map((c) => c.status);
    expect(statuses.filter((s) => s === "few")).toHaveLength(1);
    expect(statuses.filter((s) => s === "full").length).toBeGreaterThan(0);
    expect(BDCC_CONTENT.cohorts.items.length).toBeGreaterThanOrEqual(3);
  });

  it("palette tokens are well-formed colors", () => {
    for (const value of Object.values(BDCC_PALETTE)) {
      expect(value).toMatch(/^(#[0-9a-f]{6}|rgba?\(.+\))$/i);
    }
  });
});
