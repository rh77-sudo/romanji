import KuroshiroImport from "kuroshiro";
import KuromojiAnalyzerImport from "kuroshiro-analyzer-kuromoji";
import { sanitizeFuriganaHtml } from "./sanitize";

type KuroshiroCtor = typeof import("kuroshiro").default;
type AnalyzerCtor = typeof import("kuroshiro-analyzer-kuromoji").default;

function unwrapDefault<T>(mod: T | { default: T }): T {
  if (typeof mod === "function") {
    return mod;
  }
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

const Kuroshiro = unwrapDefault(KuroshiroImport as KuroshiroCtor | { default: KuroshiroCtor });
const KuromojiAnalyzer = unwrapDefault(
  KuromojiAnalyzerImport as AnalyzerCtor | { default: AnalyzerCtor },
);

export type ConvertResult = {
  furiganaHtml: string;
  romaji: string;
};

let instance: InstanceType<KuroshiroCtor> | null = null;

export async function initConverter(
  dictPath = `${import.meta.env.BASE_URL}dict/`,
): Promise<void> {
  if (instance) {
    return;
  }
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer({ dictPath }));
  instance = kuroshiro;
}

export async function convertJapanese(text: string): Promise<ConvertResult> {
  if (!instance) {
    throw new Error("Converter is not initialized");
  }
  if (text.trim() === "") {
    throw new Error("Input is empty");
  }

  const [furiganaRaw, romaji] = await Promise.all([
    instance.convert(text, { to: "hiragana", mode: "furigana" }),
    instance.convert(text, { to: "romaji", mode: "spaced", romajiSystem: "hepburn" }),
  ]);

  return {
    furiganaHtml: sanitizeFuriganaHtml(furiganaRaw),
    romaji,
  };
}
