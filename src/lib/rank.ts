export const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crystal", "Master"] as const;
export const GM_RATING = 2100;
export const LEGEND_SPOTS = 25;

/** Each tier division spans 100 rating; Grandmaster at 2100+; Legend = top 25 Grandmasters. */
export function rankName(rating: number, legend = false): string {
  if (legend) return "Legend";
  if (rating >= GM_RATING) return "Grandmaster";
  const d = Math.floor(Math.max(0, rating) / 100);
  return `${TIERS[Math.floor(d / 3)]} ${(d % 3) + 1}`;
}

export function rankKey(rating: number, legend = false): string {
  if (legend) return "legend";
  if (rating >= GM_RATING) return "grandmaster";
  return TIERS[Math.floor(Math.floor(Math.max(0, rating) / 100) / 3)].toLowerCase();
}

export function rankProgress(rating: number): number {
  if (rating >= GM_RATING) return 100;
  return rating % 100;
}
