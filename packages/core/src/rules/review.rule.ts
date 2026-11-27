import type { Walker, WalkerReview } from '../models/walker.model';
import type { WalkRequest } from '../models/walk-request.model';

/** Construye la reseña pública que se agrega al paseador al calificar un paseo. */
export function buildWalkerReview(
  request: WalkRequest,
  rating: number,
  comment?: string
): WalkerReview {
  return {
    id: `rev_${request.id}`,
    authorName: request.ownerName,
    zone: request.ownerZone,
    rating,
    comment: comment ?? '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Agrega la reseña al paseador y recalcula promedio y cantidad.
 * Idempotente: si ya existe una reseña con el mismo id, no la duplica.
 */
export function applyReviewToWalker(walker: Walker, review: WalkerReview): Walker {
  const reviews = walker.reviews ?? [];
  if (reviews.some((r) => r.id === review.id)) return walker;
  const count = walker.reviewsCount ?? 0;
  const nextCount = count + 1;
  const nextRating =
    count > 0 ? (walker.rating * count + review.rating) / nextCount : review.rating;
  return {
    ...walker,
    reviews: [review, ...reviews],
    reviewsCount: nextCount,
    rating: Math.round(nextRating * 10) / 10,
  };
}
