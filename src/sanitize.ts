const ALLOWED_TAGS = new Set(["ruby", "rb", "rt", "rp"]);

export function sanitizeFuriganaHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (full, tag: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) {
      return "";
    }
    return full.startsWith("</") ? `</${name}>` : `<${name}>`;
  });
}
