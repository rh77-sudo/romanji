export async function copyText(text: string): Promise<void> {
  if (!text) {
    throw new Error("Nothing to copy");
  }
  await navigator.clipboard.writeText(text);
}
