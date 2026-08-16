# Romaji converter — implementation phases

Walk these in order. Verify before checking a phase off.

- [x] **Phase 1 — Scaffold**
  Vite + TypeScript, Vitest, `.gitignore`, README.
  Verify: `npm test` passes; `npm run build` succeeds.

- [x] **Phase 2 — Converter**
  `src/converter.ts`, `src/sanitize.ts`, kuromoji dict in `public/dict`, fixture + sanitize tests.
  Verify: `npm test` passes.

- [x] **Phase 3 — UI + copy + states**
  Input, Convert, status, furigana, romaji, copy buttons, loading/empty/error.
  Verify: `npm test` passes; `npm run build` succeeds.

- [x] **Phase 4 — Night-study-lamp polish + browser verification**
  Distinctive study-desk UI. Exercise convert, copy, empty, mixed text, desktop + narrow viewports.
  Verify: browser checks pass; tests and build still pass.
