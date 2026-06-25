/** Lightweight text helpers used across notes/search. */

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Strip markdown syntax to a plain-text preview for cards / search snippets. */
export function plainPreview(md: string, max = 140): string {
  const stripped = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // internal links
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/[#>*_`~\-]+/g, ' ') // md tokens
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? `${stripped.slice(0, max).trimEnd()}…` : stripped;
}

const LINK_RE = /\[\[([^\]]+)\]\]/g;

/** Extract the titles referenced by [[wiki links]] inside a note body. */
export function extractLinkTitles(md: string): string[] {
  const titles = new Set<string>();
  let match: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(md)) !== null) {
    const title = match[1].trim();
    if (title) titles.add(title);
  }
  return [...titles];
}

export function deriveTitle(body: string, fallback = 'Untitled'): string {
  const firstLine = body.split('\n').find((l) => l.trim().length > 0);
  if (!firstLine) return fallback;
  return firstLine.replace(/^#+\s*/, '').trim().slice(0, 80) || fallback;
}
