/**
 * Calculates the price for a 60-minute walk based on the 30-minute price:
 * min(50, round(price30 * 1.6)) Bs.
 */
export function calculatePrice60(price30: number): number {
  return Math.min(50, Math.round(price30 * 1.6));
}

