# Romaji Converter — Design Spec

Date: 2026-08-16

## Problem

A Japanese learner often sees a sentence that uses kanji and cannot pronounce it. They need a local, instant way to turn pasted Japanese into something they can read aloud.

## Product

A single-page local web app. Paste Japanese, click Convert, see:

1. The original sentence with hiragana furigana over kanji
2. Spaced Hepburn romaji
3. A copy control on each output panel

The project folder is `romanji`. UI copy uses the correct term **romaji**.

## Out of scope (v1)

- Speech / TTS
- Conversion history
- Word-by-word English meanings
- Screenshot / OCR input
- Manual reading overrides
- React, Vue, or any backend

## Architecture

Client-only Vite + TypeScript. No React.

`kuroshiro` + `kuroshiro-analyzer-kuromoji` run in the browser. The kuromoji dictionary is served from `public/dict` and loaded once on boot.

```
boot
  → init KuromojiAnalyzer({ dictPath: "/dict/" })
  → kuroshiro.init(analyzer)
  → enable Convert

user pastes Japanese → clicks Convert
  → furiganaHtml = convert(text, { to: "hiragana", mode: "furigana" })
  → romaji       = convert(text, { to: "romaji", mode: "spaced", romajiSystem: "hepburn" })
  → sanitize furigana HTML (ruby/rb/rt/rp only)
  → render + copy
```

## Public API

```ts
type ConvertResult = {
  furiganaHtml: string;
  romaji: string;
};

function initConverter(): Promise<void>;
function convertJapanese(text: string): Promise<ConvertResult>;
function sanitizeFuriganaHtml(html: string): string;
function copyText(text: string): Promise<void>;
```

`convertJapanese` throws if the converter is not initialized, or if input is empty/whitespace.

## UI

Stacked layout, night-study-lamp aesthetic: dark indigo desk, warm paper reading surface, vermillion accents.

1. Title + one-line purpose
2. Textarea + Convert
3. Status line (loading / error / idle)
4. Furigana panel + Copy
5. Romaji panel + Copy

States:

- Loading: dictionary initializing; Convert disabled
- Ready, empty: Convert disabled; outputs blank
- Success: both panels filled
- Error: inline message; Convert stays available after a failed convert

Convert is disabled while loading or when the textarea is empty. Copy feedback: button reads “Copied” briefly.

Mixed English + Japanese is allowed. Input is never treated as HTML.

Kuromoji readings are imperfect on names and ambiguous words. v1 accepts that.

## Testing

- `こんにちは` romaji matches locked kuroshiro Hepburn fixture
- `私は学生です` romaji is spaced; furigana HTML includes `<ruby>` for 私 / 学生
- empty / whitespace throws
- `hello 日本` keeps `hello` and romanizes 日本
- sanitize allows `ruby/rb/rt/rp` and strips `script` / event handlers

Browser verification (Phase 4): first-load loading state, known sentence, both copy buttons, empty Convert no-op, mixed text, desktop and ~390px viewports.
