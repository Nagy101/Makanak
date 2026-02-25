// ═══════════════════════════════════════════════════════════════
//  ReviewItem — Single review card.
//
//  Roles:
//    • Tenant: Delete button shown only for their own review
//              (matched by user.name === reviewerName).
//    • Admin:  Delete button shown for ALL reviews.
//    • Owner:  Read-only view, no delete action.
//
//  Performance:
//    ✓ React.memo  — skip re-render when props are identical.
//    ✓ useCallback — stable delete handler reference.
//    ✓ loading="lazy" on <img> with explicit width/height (CLS prevention).
//    ✓ Fallback avatar when reviewerPhotoUrl is null/broken.
//    ✓ Atomic Zustand selector (s => s.user).
// ═══════════════════════════════════════════════════════════════
import { memo, useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/features/auth/store/authStore';
import StarRating from './StarRating';
import type { Review } from '../review.types';

// ── Fallback avatar URL ───────────────────────────────────────
const FALLBACK_AVATAR = '/placeholder.svg';

// ── Helper: resolve image URL ─────────────────────────────────
function resolvePhotoUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_AVATAR;
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return `/${url}`;
}

// ── Props ─────────────────────────────────────────────────────
interface ReviewItemProps {
  review: Review;
  onDelete: (reviewId: number) => void;
  isDeleting: boolean;
}

// ── Component ─────────────────────────────────────────────────
const ReviewItem = memo(function ReviewItem({
  review,
  onDelete,
  isDeleting,
}: ReviewItemProps) {
  // Atomic selector — only re-renders if `user` object reference changes
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === 'Admin';
  const isOwner = user?.name === review.reviewerName;
  const canDelete = isAdmin || isOwner;

  // Stable callback reference — not recreated on every render
  const handleDelete = useCallback(
    () => onDelete(review.id),
    [onDelete, review.id],
  );

  // CLS prevention: track broken images locally
  const [imgSrc, setImgSrc] = useState(() =>
    resolvePhotoUrl(review.reviewerPhotoUrl),
  );

  const handleImgError = useCallback(
    () => setImgSrc(FALLBACK_AVATAR),
    [],
  );

  return (
    <article className="flex gap-4 py-5 border-b border-gray-100 last:border-none">
      {/* ── Reviewer Avatar ───────────────────────────── */}
      <img
        src={imgSrc}
        alt={review.reviewerName}
        width={44}
        height={44}
        loading="lazy"
        onError={handleImgError}
        className="h-11 w-11 rounded-full object-cover flex-shrink-0 bg-gray-100"
      />

      {/* ── Review Body ───────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-semibold text-[#1E3A8A] text-sm leading-tight truncate">
              {review.reviewerName}
            </p>
            <time
              dateTime={review.createdAt}
              className="text-xs text-gray-500"
            >
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </time>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <StarRating value={review.rating} size={16} />

            {/* ── Delete Button (conditional by role) ─── */}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete review"
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Comment */}
        <p className="mt-2 text-sm text-gray-700 leading-relaxed break-words">
          {review.comment}
        </p>
      </div>
    </article>
  );
});

export default ReviewItem;
