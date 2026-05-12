"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Star, Plus, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface PosterItem {
  tmdbId: string;
  title: string;
  type: string;
  year: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  genre?: string;
}

interface PosterRowProps<T extends PosterItem> {
  items: T[];
  onAdd: (item: T) => Promise<void>;
  addedIds: string[];
  loadingId?: string | null;
  getAddLabel?: (item: T) => string;
}

export function PosterRow<T extends PosterItem>({ items, onAdd, addedIds, loadingId, getAddLabel }: PosterRowProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, items]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -480 : 480, behavior: "smooth" });
  }

  const isAdded = (id: string) => addedIds.includes(id);

  return (
    <div className="relative group/row">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none rounded-l-xl" />
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-2 top-[30%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <>
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none rounded-r-xl" />
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-2 top-[30%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground hover:bg-muted transition opacity-0 group-hover/row:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Scroll container — padding-right ensures last card is fully visible */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: "2px",
          paddingRight: "40px", // guarantees last card clears the fade
        }}
      >
        {items.map((item) => (
          <div key={item.tmdbId} className="shrink-0 w-[130px] sm:w-[150px] group">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-muted shadow-sm hover:shadow-lg transition-all duration-300">
              {item.poster && (
                <img
                  src={item.posterSmall || item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Rating badge */}
              {item.tmdbRating > 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-white font-medium">
                    {item.tmdbRating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Add button */}
              <button
                type="button"
                onClick={() => onAdd(item)}
                disabled={isAdded(item.tmdbId) || loadingId === item.tmdbId}
                aria-label={getAddLabel ? getAddLabel(item) : isAdded(item.tmdbId) ? "Added" : "Add to watchlist"}
                className={`absolute bottom-2 right-2 h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md disabled:cursor-default
                  ${isAdded(item.tmdbId)
                    ? "bg-green-500 text-white opacity-100"
                    : "bg-white/90 text-gray-800 hover:bg-white opacity-0 group-hover:opacity-100"
                  }`}
              >
                {loadingId === item.tmdbId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-600" />
                ) : isAdded(item.tmdbId) ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="mt-2 px-0.5">
              <p className="text-xs font-medium truncate leading-snug">{item.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}