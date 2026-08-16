// @vitest-environment node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { convertJapanese, initConverter } from "./converter";

const dictPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../node_modules/kuromoji/dict/",
);

describe("convertJapanese", () => {
  beforeAll(async () => {
    await initConverter(dictPath);
  }, 60_000);

  it("romanizes a hiragana greeting", async () => {
    const result = await convertJapanese("こんにちは");
    expect(result.romaji).toBe("konnichiwa");
  });

  it("adds furigana ruby and spaced romaji for a kanji sentence", async () => {
    const result = await convertJapanese("私は学生です");
    expect(result.romaji).toBe("watashi wa gakusei desu");
    expect(result.furiganaHtml).toContain("<ruby>私");
    expect(result.furiganaHtml).toContain("<ruby>学生");
    expect(result.furiganaHtml).toContain("<rt>わたし</rt>");
    expect(result.furiganaHtml).toContain("<rt>がくせい</rt>");
  });

  it("throws on empty or whitespace input", async () => {
    await expect(convertJapanese("")).rejects.toThrow(/empty/i);
    await expect(convertJapanese("   ")).rejects.toThrow(/empty/i);
  });

  it("keeps latin text and romanizes mixed Japanese", async () => {
    const result = await convertJapanese("hello 日本");
    expect(result.romaji).toMatch(/hello/i);
    expect(result.romaji).toMatch(/nippon/i);
    expect(result.furiganaHtml).toContain("hello");
    expect(result.furiganaHtml).toContain("<ruby>日本");
  });
});
