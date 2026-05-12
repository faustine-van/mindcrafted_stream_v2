"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Film, SlidersHorizontal } from "lucide-react";
import { WatchCard } from "@/app/(watchlist)/watchlist/components/WatchCard";
import type { WatchItem } from "@/app/(watchlist)/watchlist/components/WatchCard";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */

// How many cards to render on first paint.
const INITIAL_PAGE_SIZE = 30;

// How many more cards to add each time the sentinel enters the viewport.
const PAGE_SIZE = 24;

const GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5";

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-muted relative">
        <div className="absolute top-2 left-2 h-4 w-8 bg-muted-foreground/20 rounded" />
        <div className="absolute top-2 right-2 h-4 w-10 bg-muted-foreground/20 rounded" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="h-2.5 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded-full w-24 mt-1" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Empty state
───────────────────────────────────────── */
function EmptyState({
  hasFilters,
  onAddNew,
  onClearFilters,
}: {
  hasFilters: boolean;
  onAddNew: () => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="col-span-full">
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border bg-card/40 px-8 py-16 gap-4">
        <div
          className={`h-16 w-16 rounded-2xl grid place-items-center ${
            hasFilters ? "bg-amber-500/10" : "bg-violet-500/10"
          }`}
        >
          {hasFilters ? (
            <SlidersHorizontal className="h-7 w-7 text-amber-500" />
          ) : (
            <Film className="h-7 w-7 text-violet-500" />
          )}
        </div>

        <div className="space-y-1 max-w-xs">
          <h3 className="text-base font-semibold">
            {hasFilters ? "No matches found" : "Your watchlist is empty"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {hasFilters
              ? "Nothing in your library matches those filters. Try loosening your search or clearing them."
              : "Add your first movie or TV show and start building your personal library."}
          </p>
        </div>

        {hasFilters ? (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClearFilters}
              className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={onAddNew}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add title
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAddNew}
            className="mt-1 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add your first title
          </button>
        )}

        {!hasFilters && (
          <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
            {["Movies", "TV shows", "Rate & review"].map((hint) => (
              <span key={hint} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                {hint}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sentinel — the invisible div at the
   bottom of the rendered cards that triggers
   the next page when it enters the viewport.
───────────────────────────────────────── */
function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onVisible();
      },
      // Start loading the next batch 300px before the sentinel
      // reaches the bottom of the viewport — feels instant to the user.
      { rootMargin: "0px 0px 300px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={ref} className="col-span-full h-1" aria-hidden="true" />;
}

/* ─────────────────────────────────────────
   Main grid
───────────────────────────────────────── */
interface Props {
  isLoading: boolean;
  filteredItems: WatchItem[];
  totalItems: number;
  onUpdate: (id: string, changes: Partial<WatchItem>) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onClearFilters: () => void;
}

export function WatchlistGrid({
  isLoading,
  filteredItems,
  totalItems,
  onUpdate,
  onDelete,
  onAddNew,
  onClearFilters,
}: Props) {
  // `visibleCount` tracks how many items from filteredItems are in the DOM.
  // It starts at INITIAL_PAGE_SIZE and grows by PAGE_SIZE each time the
  // sentinel scrolls into view. It resets whenever filteredItems changes
  // (new filter, new search, tab switch) so you always see fresh results
  // from the top without stale cards from the previous slice.
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // Reset to first page whenever the list itself changes.
  // This covers filter changes, search, tab switches, and optimistic adds.
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [filteredItems]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      // Guard: don't schedule a state update if we're already showing everything.
      if (prev >= filteredItems.length) return prev;
      return Math.min(prev + PAGE_SIZE, filteredItems.length);
    });
  }, [filteredItems.length]);

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 12 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const hasFilters = totalItems > 0 && filteredItems.length === 0;
  const isEmpty = totalItems === 0;

  // ── Empty / no-filter-match ──
  if (isEmpty || hasFilters) {
    return (
      <div className={GRID}>
        <EmptyState
          hasFilters={hasFilters}
          onAddNew={onAddNew}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  // The slice that's actually in the DOM right now.
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;
  const remaining = filteredItems.length - visibleCount;

  return (
    <>
      <div className={GRID}>
        {visibleItems.map((item) => (
          <WatchCard
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        {/* Sentinel sits inside the grid as a full-width row.
            When it enters the viewport, loadMore fires. */}
        {hasMore && <Sentinel onVisible={loadMore} />}
      </div>

      {/* Subtle count footer — disappears once everything is visible */}
      {hasMore && (
        <p className="text-center text-xs text-muted-foreground pt-2 pb-4">
          Showing {visibleCount} of {filteredItems.length} —{" "}
          <button
            type="button"
            onClick={() => setVisibleCount(filteredItems.length)}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            show all {remaining} remaining
          </button>
        </p>
      )}
    </>
  );
}
