/**
 * HTML → TOC helpers for public article reading (MES-025).
 */

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[^;]+;/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

/** Inject ids into h2/h3 and return TOC + rewritten HTML. */
export function prepareArticleHtml(html: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const rewritten = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr: string, attrs: string, inner: string) => {
      const level = Number(levelStr) as 2 | 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return _match;

      let id = slugify(text) || `section-${toc.length + 1}`;
      let n = 1;
      while (used.has(id)) {
        id = `${slugify(text)}-${n++}`;
      }
      used.add(id);
      toc.push({ id, text, level });

      if (/\sid\s*=/.test(attrs)) {
        return `<h${level}${attrs}>${inner}</h${level}>`;
      }
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: rewritten, toc };
}
