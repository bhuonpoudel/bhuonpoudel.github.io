export type PageToken = number | "ellipsis";

/**
 * Windowed page list: 1 … 4 5 [6] 7 8 … 20
 * `siblings` = pages shown either side of the current one.
 */
export function pageWindow(current: number, last: number, siblings = 1): PageToken[] {
  const total = siblings * 2 + 5; // first, last, current, 2 ellipses
  if (last <= total) return Array.from({ length: last }, (_, i) => i + 1);

  const start = Math.max(2, current - siblings);
  const end = Math.min(last - 1, current + siblings);
  const tokens: PageToken[] = [1];
  if (start > 2) tokens.push("ellipsis");
  for (let p = start; p <= end; p++) tokens.push(p);
  if (end < last - 1) tokens.push("ellipsis");
  tokens.push(last);
  return tokens;
}

/** URL for page `n` given the base path of a paginated route. */
export function pageHref(basePath: string, n: number) {
  const base = basePath.replace(/\/$/, "");
  return n === 1 ? base || "/" : `${base}/${n}`;
}
