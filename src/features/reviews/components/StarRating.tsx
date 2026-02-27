// ═══════════════════════════════════════════════════════════════
//  StarRating — Reusable star display & selection component.
//
//  Performance: React.memo — prevents re-render when parent
//    re-renders with identical props.
// ═══════════════════════════════════════════════════════════════
import { memo, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Props ──────────────────────────────────────────────────────
interface StarRatingProps {
  /** Current rating value (1–5) */
  value: number;
  /** If provided, makes the component interactive (star selector). */
  onChange?: (rating: number) => void;
  /** Visual size of each star icon in pixels. Defaults to 20. */
  size?: number;
  /** Extra class names for the wrapper. */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────
const StarRating = memo(function StarRating({
  value,
  onChange,
  size = 20,
  className,
}: StarRatingProps) {
  const interactive = typeof onChange === "function";

  // useCallback: stable handler refs — avoids re-creating a new
  // function reference on every render when passed as props.
  const handleClick = useCallback(
    (star: number) => {
      if (interactive) onChange(star);
    },
    [interactive, onChange],
  );

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? "Rating selector" : `Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm",
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default pointer-events-none",
            )}
          >
            <Star
              width={size}
              height={size}
              // Filled stars: deep royal blue fill, no outline; empty: grey outline
              className={cn(
                "transition-colors",
                filled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-border",
              )}
            />
          </button>
        );
      })}
    </div>
  );
});

export default StarRating;
