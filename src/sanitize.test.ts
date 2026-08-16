import { describe, expect, it } from "vitest";
import { sanitizeFuriganaHtml } from "./sanitize";

describe("sanitizeFuriganaHtml", () => {
  it("keeps ruby markup", () => {
    const input = "<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は";
    expect(sanitizeFuriganaHtml(input)).toBe(input);
  });

  it("strips script tags and leaves only text", () => {
    const input = "<ruby>日<rt>にち</rt></ruby><script>alert(1)</script>";
    const out = sanitizeFuriganaHtml(input);
    expect(out).toContain("<ruby>");
    expect(out).toContain("</ruby>");
    expect(out.toLowerCase()).not.toContain("<script");
  });

  it("strips event handlers", () => {
    const input = '<ruby onclick="alert(1)">漢<rt>かん</rt></ruby>';
    const out = sanitizeFuriganaHtml(input);
    expect(out.toLowerCase()).not.toContain("onclick");
    expect(out).toContain("<ruby>");
  });
});
