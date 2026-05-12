"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { WatchItem, WatchStatus } from "./WatchCard";

export type ViewMode = "all" | "watching" | "watched" | "unwatched" | "favorites";
export type SortOption =
  | "date-desc" | "date-asc"
  | "title-asc" | "title-desc"
  | "year-desc" | "year-asc"
  | "rating-desc" | "rating-asc"
  | "tmdb-rating-desc";

function mapStatus(watched: boolean): WatchStatus {
  if (watched) return "Watched";
  return "Want to Watch";
}

/* ─────────────────────────────────────────
   localStorage helpers — safe (SSR + quota errors)
───────────────────────────────────────── */
function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private-mode restriction — silently ignore
  }
}

const LS_VIEW_MODE = "watchlist:viewMode";
const LS_SORT_BY   = "watchlist:sortBy";

/* ─────────────────────────────────────────
   Hook
───────────────────────────────────────── */
export function useWatchlist(initialItems: WatchItem[] = []) {
  const [items, setItems] = useState<WatchItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(initialItems.length === 0);

  const [searchQuery, setSearchQuery]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genreFilter, setGenreFilter]   = useState("all");
  const [yearFilter, setYearFilter]     = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [viewMode, setViewModeState] = useState<ViewMode>(() =>
    readStorage<ViewMode>(LS_VIEW_MODE, "all")
  );
  const [sortBy, setSortByState] = useState<SortOption>(() =>
    readStorage<SortOption>(LS_SORT_BY, "date-desc")
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Persist viewMode to localStorage whenever it changes ── */
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    writeStorage(LS_VIEW_MODE, mode);
  }, []);

  /* ── Persist sortBy to localStorage whenever it changes ── */
  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    writeStorage(LS_SORT_BY, sort);
  }, []);

  /* ─────────────────────────────────────────
     sync items when the server sends fresh props.
     After router.refresh()
  ───────────────────────────────────────── */
  useEffect(() => {

    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  /* ── Fallback fetch when no SSR data is available ── */
  const fetchWatchlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/watchlist", { credentials: "include" });
      if (!res.ok) return;
      const rows: Record<string, unknown>[] = await res.json();
      setItems(
        rows.map((row) => ({
          id:          row.id as string,
          title:       row.title as string,
          genre:       (row.genre as string)       ?? "",
          status:      mapStatus(!!row.watched),
          rating:      (row.rating as number)      ?? 0,
          poster:      (row.poster as string)      ?? "",
          backdrop:    (row.backdrop as string)    ?? "",
          type:        row.type as "movie" | "tv",
          year:        (row.year as string)        ?? "",
          plot:        (row.plot as string)        ?? "",
          tmdb_id:     (row.tmdb_id as string)     ?? "",
          runtime:     (row.runtime as number)     ?? 0,
          tmdb_rating: (row.tmdb_rating as number) ?? 0,
          favorite:    (row.favorite as boolean)   ?? false,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialItems.length === 0) fetchWatchlist();
  }, [fetchWatchlist, initialItems.length]);

  /* ── Search debounce ── */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 250);
  };

  /* ── Optimistic mutations ── */
  const handleOptimisticUpdate = useCallback((id: string, changes: Partial<WatchItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const handleOptimisticDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const optimisticCounter = useRef(0);
  const handleOptimisticAdd = useCallback((item: WatchItem) => {
    const safeItem: WatchItem = {
      ...item,
      id: item.id.startsWith("optimistic-")
        ? `optimistic-${Date.now()}-${++optimisticCounter.current}`
        : item.id,
    };
    setItems((prev) => [safeItem, ...prev]);
  }, []);

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setGenreFilter("all");
    setYearFilter("all");
    setRatingFilter("all");
  };

  /* ── Derived stats + unique filter values ── */
  const { stats, uniqueGenres, uniqueYears } = useMemo(() => {
    const genres = new Set<string>();
    const years  = new Set<string>();
    let watching = 0, watched = 0, favorites = 0, movies = 0;
    let totalRating = 0, ratedCount = 0;

    for (const item of items) {
      if (item.status === "Watching") watching++;
      if (item.status === "Watched")  watched++;
      if (item.favorite) favorites++;
      if (item.type === "movie") movies++;
      if (item.rating && item.rating > 0) {
        totalRating += item.rating;
        ratedCount++;
      }
      if (item.genre) {
        item.genre.split(",").forEach((g: string) => genres.add(g.trim()));
      }
      if (item.year) years.add(item.year);
    }

    return {
      stats: {
        total:         items.length,
        watching,
        watched,
        unwatched:     items.filter((i) => i.status === "Want to Watch").length,
        favorites,
        movies,
        series:        items.filter((i) => i.type === "tv").length,
        averageRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : "—",
      },
      uniqueGenres: Array.from(genres).sort(),
      uniqueYears:  Array.from(years).sort().reverse(),
    };
  }, [items]);

  /* ── Filtered + sorted list ── */
  const filteredItems = useMemo(() => {
    let list = [...items];

    if (viewMode === "watching")  list = list.filter((i) => i.status === "Watching");
    if (viewMode === "watched")   list = list.filter((i) => i.status === "Watched");
    if (viewMode === "unwatched") list = list.filter((i) => i.status === "Want to Watch");
    if (viewMode === "favorites") list = list.filter((i) => i.favorite);

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.genre?.toLowerCase().includes(q) ||
          i.year?.toLowerCase().includes(q)
      );
    }

    if (genreFilter  !== "all") list = list.filter((i) => i.genre?.includes(genreFilter));
    if (yearFilter   !== "all") list = list.filter((i) => i.year === yearFilter);
    if (ratingFilter !== "all") list = list.filter((i) => i.rating >= parseInt(ratingFilter));

    list.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (b.created_at ?? b.id ?? "").localeCompare(a.created_at ?? a.id ?? "");
        case "date-asc":
          return (a.created_at ?? a.id ?? "").localeCompare(b.created_at ?? b.id ?? "");
        case "title-asc":        return a.title.localeCompare(b.title);
        case "title-desc":       return b.title.localeCompare(a.title);
        case "year-desc":        return (b.year ?? "").localeCompare(a.year ?? "");
        case "year-asc":         return (a.year ?? "").localeCompare(b.year ?? "");
        case "rating-desc":      return (b.rating ?? 0) - (a.rating ?? 0);
        case "rating-asc":       return (a.rating ?? 0) - (b.rating ?? 0);
        case "tmdb-rating-desc": return (b.tmdb_rating ?? 0) - (a.tmdb_rating ?? 0);
        default:                 return 0;
      }
    });

    return list;
  }, [items, viewMode, debouncedSearch, genreFilter, yearFilter, ratingFilter, sortBy]);

  const activeFiltersCount = [
    debouncedSearch,
    genreFilter  !== "all",
    yearFilter   !== "all",
    ratingFilter !== "all",
  ].filter(Boolean).length;

  return {
    items,
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
    fetchWatchlist,
    handleOptimisticUpdate,
    handleOptimisticDelete,
    handleOptimisticAdd,
  };
}