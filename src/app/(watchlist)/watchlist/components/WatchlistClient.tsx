"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWatchlist } from "./use-watchlist";
import { WatchlistToolbar } from "./WatchlistToolbar";
import { WatchlistViewTabs } from "./WatchlistViewTabs";
import { WatchlistFilters } from "./WatchlistFilters";
import { WatchlistGrid } from "./WatchlistGrid";
import { AddItemModal } from "./AddItemModal";
import { HeroSection } from "./HeroSection";
import type { WatchItem } from "@/app/(watchlist)/watchlist/components/WatchCard";

// DiscoverItem shape must match what HeroSection / DiscoverPanel expects.
interface DiscoverItem {
  tmdbId: string;
  title: string;
  type: string;
  year: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  genre?: string;
}

interface Props {
  items: WatchItem[];
  existingIds?: string[];
  initialTrending?: DiscoverItem[];
}

export function WatchlistClient({
  items: initialItems,
  existingIds = [],
  initialTrending = [],
}: Props) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    isLoading,
    filteredItems,
    stats,
    uniqueGenres,
    uniqueYears,
    searchQuery,
    debouncedSearch,
    genreFilter,
    yearFilter,
    ratingFilter,
    viewMode,
    sortBy,
    activeFiltersCount,
    handleSearchChange,
    setGenreFilter,
    setYearFilter,
    setRatingFilter,
    setViewMode,
    setSortBy,
    clearAllFilters,
    handleOptimisticUpdate,
    handleOptimisticDelete,
    handleOptimisticAdd,
    items,
  } = useWatchlist(initialItems);

  // Derive the featured item live from reactive `items` so it updates
  // the moment a new "Watching" item is added optimistically.
  const featuredItem = useMemo(
    () => items.find((i) => i.status === "Watching") ?? items[0] ?? null,
    [items]
  );

  function handleAdded(newItem?: WatchItem) {
    if (newItem) handleOptimisticAdd(newItem);
    setShowAddModal(false);
    // Background refresh so server snapshot catches up (poster URLs etc.)
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* ── Hero: Featured / Overview / Activity / Discover ── */}
      <HeroSection
        featured={featuredItem}
        stats={stats}
        items={items}
        existingIds={existingIds}
        initialTrending={initialTrending}
      />

      {/* ── View tabs ── */}
      <WatchlistViewTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
      />

      {/* ── Toolbar + filters ── */}
      <div className="space-y-3">
        <WatchlistToolbar
          searchQuery={searchQuery}
          sortBy={sortBy}
          showFilters={showFilters}
          activeFiltersCount={activeFiltersCount}
          onSearchChange={handleSearchChange}
          onSortChange={setSortBy}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onAddNew={() => setShowAddModal(true)}
        />

        {showFilters && (
          <WatchlistFilters
            genreFilter={genreFilter}
            yearFilter={yearFilter}
            ratingFilter={ratingFilter}
            debouncedSearch={debouncedSearch}
            uniqueGenres={uniqueGenres}
            uniqueYears={uniqueYears}
            activeFiltersCount={activeFiltersCount}
            onGenreChange={setGenreFilter}
            onYearChange={setYearFilter}
            onRatingChange={setRatingFilter}
            onClearSearch={() => handleSearchChange("")}
            onClearAll={clearAllFilters}
          />
        )}

        {filteredItems.length !== items.length && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
          </p>
        )}
      </div>

      {/* ── Grid ── */}
      <WatchlistGrid
        isLoading={isLoading}
        filteredItems={filteredItems}
        totalItems={items.length}
        onUpdate={handleOptimisticUpdate}
        onDelete={handleOptimisticDelete}
        onAddNew={() => setShowAddModal(true)}
        onClearFilters={clearAllFilters}
      />

      {/* ── Add modal ── */}
      <AddItemModal
        open={showAddModal}
        onOpenChange={(v) => setShowAddModal(v)}
        onAdded={handleAdded}
      />
    </div>
  );
}