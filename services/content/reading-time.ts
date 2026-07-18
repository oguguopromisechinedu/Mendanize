/** Pure reading-time helper — safe for client and server. */
export function estimateReadingTimeMin(htmlOrText: string): number {
  const text = htmlOrText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
