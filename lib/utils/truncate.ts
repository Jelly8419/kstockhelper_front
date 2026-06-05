/**
 * Build a preview from body text.
 * PRD: show first 70 words of the translated body, then an ellipsis.
 */
export function previewWords(text: string, maxWords = 70): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ") + " …";
}
