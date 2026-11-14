import React from "react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showReviewCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  rating,
  reviewCount,
  showReviewCount = false,
  size = "sm",
}: RatingStarsProps) {
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;

  const iconSizeClass =
    size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <span
                key={i}
                className={`material-symbols-outlined ${iconSizeClass}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            );
          }
          if (i === fullStars && hasHalfStar) {
            return (
              <span
                key={i}
                className={`material-symbols-outlined ${iconSizeClass}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star_half
              </span>
            );
          }
          return (
            <span
              key={i}
              className={`material-symbols-outlined text-outline-variant ${iconSizeClass}`}
            >
              star
            </span>
          );
        })}
      </div>

      {showReviewCount && (
        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-outline ml-1">({reviewCount}+ Değerlendirme)</span>
          )}
        </span>
      )}
    </div>
  );
}

export default RatingStars;

