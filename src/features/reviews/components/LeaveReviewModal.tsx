// ═══════════════════════════════════════════════════════════════
//  LeaveReviewModal — Tenant-only modal to submit a new review.
//
//  Integration Instructions (TenantBookingsPage):
//  ─────────────────────────────────────────────────────────────
//  1. Import this modal lazily:
//       const LeaveReviewModal = lazy(
//         () => import(
//           /* webpackChunkName: "reviews-module" */
//           '@/features/reviews/components/LeaveReviewModal'
//         )
//       );
//
//  2. Add state to track which booking is being reviewed:
//       const [reviewBookingId, setReviewBookingId] = useState<{
//         bookingId: number; propertyId: number
//       } | null>(null);
//
//  3. Inside the BookingCard for COMPLETED bookings only, add:
//       {booking.status === 'Completed' && (
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() =>
//             setReviewBookingId({
//               bookingId: booking.id,
//               propertyId: booking.propertyId,
//             })
//           }
//         >
//           <Star className="h-4 w-4 mr-1" /> Leave a Review
//         </Button>
//       )}
//
//  4. Render the modal at the bottom of the page:
//       {reviewBookingId && (
//         <Suspense fallback={null}>
//           <LeaveReviewModal
//             bookingId={reviewBookingId.bookingId}
//             propertyId={reviewBookingId.propertyId}
//             open={!!reviewBookingId}
//             onClose={() => setReviewBookingId(null)}
//           />
//         </Suspense>
//       )}
// ═══════════════════════════════════════════════════════════════
import { memo, useCallback, useState } from "react";
import { Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRating from "./StarRating";
import { useCreateReview } from "../useReviews";

// ── Props ─────────────────────────────────────────────────────
interface LeaveReviewModalProps {
  /** The booking that was Completed. */
  bookingId: number;
  /**
   * The property being reviewed.
   * Used to invalidate the correct cache key after submission.
   */
  propertyId: number;
  open: boolean;
  onClose: () => void;
}

// ── Validation limits ─────────────────────────────────────────
const MIN_COMMENT = 10;
const MAX_COMMENT = 1000;

// ── Component ─────────────────────────────────────────────────
const LeaveReviewModal = memo(function LeaveReviewModal({
  bookingId,
  propertyId,
  open,
  onClose,
}: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { mutate: createReview, isPending } = useCreateReview(propertyId);

  // ── Stable handlers ────────────────────────────────────────
  const handleRatingChange = useCallback((val: number) => setRating(val), []);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value),
    [],
  );

  const handleClose = useCallback(() => {
    if (isPending) return;
    setRating(0);
    setComment("");
    onClose();
  }, [isPending, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0 || comment.trim().length < MIN_COMMENT) return;

      createReview(
        { bookingId, rating, comment: comment.trim() },
        {
          onSuccess: (res) => {
            if (res.isSuccess) handleClose();
          },
        },
      );
    },
    [bookingId, comment, createReview, handleClose, rating],
  );

  // ── Derived validations ────────────────────────────────────
  const commentTooShort =
    comment.trim().length > 0 && comment.trim().length < MIN_COMMENT;
  const isValid =
    rating > 0 &&
    comment.trim().length >= MIN_COMMENT &&
    comment.trim().length <= MAX_COMMENT;

  // ── Render ─────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
            Leave a Review
          </DialogTitle>
          <DialogDescription>
            Share your experience to help other guests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* ── Star Rating Selector ────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Your Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating
              value={rating}
              onChange={handleRatingChange}
              size={32}
            />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">
                Please select a star rating.
              </p>
            )}
          </div>

          {/* ── Comment Textarea ────────────────────────────── */}
          <div className="space-y-2">
            <Label
              htmlFor="review-comment"
              className="text-sm font-medium text-foreground"
            >
              Your Comment <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Describe your experience with this property…"
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              maxLength={MAX_COMMENT}
              disabled={isPending}
              className={`resize-none focus-visible:ring-primary ${
                commentTooShort ? "border-red-400" : ""
              }`}
            />
            <div className="flex justify-between items-center">
              {commentTooShort ? (
                <p className="text-xs text-red-500">
                  Minimum {MIN_COMMENT} characters required.
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {comment.length} / {MAX_COMMENT}
              </span>
            </div>
          </div>

          {/* ── Footer Actions ──────────────────────────────── */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default LeaveReviewModal;
