"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  rating: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}

const LABELS = ["Terrible", "Bad", "OK", "Good", "Great"];

export function StarRating({ rating, onChange, size = "md", readOnly = false }: Props) {
  const [hovered, setHovered] = useState(0);

  const iconClass = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const active    = hovered || rating;

  return (
    // role="group" + aria-label gives screen readers a named region
    // so they announce e.g. "Star rating, 3 out of 5" on focus entry.
    <div
      role="group"
      aria-label={`Star rating${rating > 0 ? `, ${rating} out of 5` : ", not yet rated"}`}
      className="flex items-center gap-1"
      onMouseLeave={() => !readOnly && setHovered(0)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const value    = i + 1;
        const filled   = i < active;
        const isToggle = value === rating; // clicking the active star clears it

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            // FIX: every star button now has a descriptive aria-label.
            // Also conveys the "click to clear" affordance when already selected.
            aria-label={
              isToggle
                ? `Clear rating (currently ${LABELS[i]})`
                : `Rate ${value} out of 5 — ${LABELS[i]}`
            }
            // aria-pressed exposes the selected state to assistive tech
            aria-pressed={value === rating}
            onClick={() => !readOnly && onChange(isToggle ? 0 : value)}
            onMouseEnter={() => !readOnly && setHovered(value)}
            className={`
              transition-transform
              ${readOnly ? "cursor-default" : "hover:scale-110 active:scale-95"}
            `}
          >
            <Star
              aria-hidden="true"
              className={`
                ${iconClass} transition-colors
                ${filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/25"
                }
              `}
            />
          </button>
        );
      })}

      {/* Human-readable label — visible, not just for screen readers */}
      {!readOnly && (
        <span
          aria-live="polite"
          aria-atomic="true"
          className="ml-1 text-xs text-muted-foreground min-w-[60px]"
        >
          {hovered > 0
            ? LABELS[hovered - 1]
            : rating > 0
            ? `${rating}/5 · ${LABELS[rating - 1]}`
            : "Not rated"}
        </span>
      )}

      {!readOnly && rating > 0 && (
        <button
          type="button"
          aria-label="Clear rating"
          onClick={() => onChange(0)}
          className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}