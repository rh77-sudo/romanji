import { copyText } from "./clipboard";
import { convertJapanese, initConverter } from "./converter";
import "./style.css";

const form = document.querySelector<HTMLFormElement>("#convert-form");
const source = document.querySelector<HTMLTextAreaElement>("#source");
const convertBtn = document.querySelector<HTMLButtonElement>("#convert-btn");
const statusEl = document.querySelector<HTMLParagraphElement>("#status");
const furiganaOut = document.querySelector<HTMLDivElement>("#furigana-out");
const romajiOut = document.querySelector<HTMLParagraphElement>("#romaji-out");
const copyFurigana = document.querySelector<HTMLButtonElement>("#copy-furigana");
const copyRomaji = document.querySelector<HTMLButtonElement>("#copy-romaji");

if (
  !form ||
  !source ||
  !convertBtn ||
  !statusEl ||
  !furiganaOut ||
  !romajiOut ||
  !copyFurigana ||
  !copyRomaji
) {
  throw new Error("Missing expected page elements");
}

const ui = {
  form,
  source,
  convertBtn,
  statusEl,
  furiganaOut,
  romajiOut,
  copyFurigana,
  copyRomaji,
};

function setStatus(message: string, kind: "idle" | "error" = "idle"): void {
  ui.statusEl.textContent = message;
  ui.statusEl.dataset.kind = kind;
}

function syncConvertEnabled(): void {
  ui.convertBtn.disabled = ui.source.disabled || ui.source.value.trim() === "";
}

function showReading(on: boolean): void {
  ui.form.classList.toggle("is-reading", on);
  ui.furiganaOut.hidden = !on;
  ui.source.hidden = on;
}

function setOutputs(furiganaHtml: string, romaji: string): void {
  ui.furiganaOut.innerHTML = furiganaHtml;
  ui.romajiOut.textContent = romaji;
  const hasOutput = furiganaHtml !== "" || romaji !== "";
  ui.copyFurigana.disabled = !hasOutput;
  ui.copyRomaji.disabled = !hasOutput;
  showReading(furiganaHtml !== "");
}

function returnToEditor(): void {
  showReading(false);
  ui.source.focus();
}

async function flashCopied(button: HTMLButtonElement): Promise<void> {
  const original = button.textContent;
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

async function boot(): Promise<void> {
  try {
    await initConverter();
    ui.source.disabled = false;
    setStatus("");
    syncConvertEnabled();
    ui.source.focus();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dictionary";
    setStatus(message, "error");
    ui.source.disabled = true;
    ui.convertBtn.disabled = true;
  }
}

ui.source.addEventListener("input", () => {
  syncConvertEnabled();
});

ui.furiganaOut.addEventListener("click", () => {
  returnToEditor();
});

ui.furiganaOut.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    returnToEditor();
  }
});

ui.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = ui.source.value;
  if (text.trim() === "") {
    return;
  }

  ui.convertBtn.disabled = true;
  setStatus("Converting…");
  try {
    const result = await convertJapanese(text);
    setOutputs(result.furiganaHtml, result.romaji);
    setStatus("");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Conversion failed";
    setStatus(message, "error");
  } finally {
    syncConvertEnabled();
  }
});

ui.copyFurigana.addEventListener("click", async () => {
  try {
    await copyText(ui.furiganaOut.innerText);
    await flashCopied(ui.copyFurigana);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copy failed";
    setStatus(message, "error");
  }
});

ui.copyRomaji.addEventListener("click", async () => {
  try {
    await copyText(ui.romajiOut.textContent ?? "");
    await flashCopied(ui.copyRomaji);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copy failed";
    setStatus(message, "error");
  }
});

void boot();
