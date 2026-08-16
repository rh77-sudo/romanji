# Romaji

Paste Japanese (including kanji) and get furigana plus Hepburn romaji so you can pronounce the sentence.

## Setup

Double-click `Romaji.bat`. It installs dependencies on first run, opens the app, and stops every process it started when you close that window.

```bash
npm install
npm run dev
```

`npm install` also copies the kuromoji dictionary into `public/dict`. Open the URL Vite prints (usually `http://localhost:5173`). The first load takes a moment while the dictionary initializes.

```bash
npm test
npm run build
```
