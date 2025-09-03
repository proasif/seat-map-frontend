// Simple mapping between price tiers and actual dollar values
export const PRICE_BY_TIER: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
};

// Lookup helper used throughout the UI
export function seatPrice(tier: number): number {
  return PRICE_BY_TIER[tier] ?? 0;
}
