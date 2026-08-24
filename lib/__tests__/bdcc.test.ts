import { describe, expect, it } from "vitest";
import {
  BDCC_CONTENT,
  BDCC_PALETTE,
  BDCC_SITE_URL,
  bdccUrl,
  mailHref,
  telHref,
} from "../bdcc";

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

  it("contact phone and email produce valid hrefs", () => {
    expect(telHref(BDCC_CONTENT.contact.phone)).toMatch(/^tel:\+\d+$/);
    expect(mailHref(BDCC_CONTENT.contact.email)).toBe(
      "mailto:support@bdcc.co.il",
    );
  });

  it("copy contains no em dashes (repo-wide rule)", () => {
    expect(JSON.stringify(BDCC_CONTENT)).not.toContain("—");
  });

  it("palette tokens are well-formed colors", () => {
    for (const value of Object.values(BDCC_PALETTE)) {
      expect(value).toMatch(/^(#[0-9a-f]{6}|rgba?\(.+\))$/i);
    }
  });
});
