"use client";

import { X, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  genreFilter: string;
  yearFilter: string;
  ratingFilter: string;
  debouncedSearch: string;
  uniqueGenres: string[];
  uniqueYears: string[];
  activeFiltersCount: number;
  onGenreChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onRatingChange: (v: string) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

const RATING_OPTIONS = [
  { value: "1", stars: 1 },
  { value: "2", stars: 2 },
  { value: "3", stars: 3 },
  { value: "4", stars: 4 },
  { value: "5", stars: 5 },
];

export function WatchlistFilters({
  genreFilter, yearFilter, ratingFilter, debouncedSearch,
  uniqueGenres, uniqueYears, activeFiltersCount,
  onGenreChange, onYearChange, onRatingChange, onClearSearch, onClearAll,
}: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Main filter row */}
      <div className="
        rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm
        px-5 py-4 space-y-4
      ">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Filters
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Genre
            </label>
            <Select value={genreFilter} onValueChange={onGenreChange}>
              <SelectTrigger className="h-9 text-sm bg-background/60 border-border/60 rounded-xl">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {uniqueGenres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Year
            </label>
            <Select value={yearFilter} onValueChange={onYearChange}>
              <SelectTrigger className="h-9 text-sm bg-background/60 border-border/60 rounded-xl">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {uniqueYears.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating — inline star pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Min rating
            </label>
            <div className="flex items-center gap-1.5 h-9">
              {/* "Any" pill */}
              <button
                type="button"
                onClick={() => onRatingChange("all")}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                  ratingFilter === "all"
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Any
              </button>
              {RATING_OPTIONS.map(({ value, stars }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRatingChange(ratingFilter === value ? "all" : value)}
                  className={`h-8 px-2 rounded-lg flex items-center gap-0.5 border transition-all ${
                    ratingFilter === value
                      ? "border-amber-400/60 bg-amber-400/10"
                      : "border-border hover:bg-muted"
                  }`}
                  title={`${stars}+ stars`}
                >
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        ratingFilter === value
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted-foreground/30 text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
            {debouncedSearch && (
              <Chip label={`"${debouncedSearch}"`} onRemove={onClearSearch} />
            )}
            {genreFilter !== "all" && (
              <Chip label={genreFilter} onRemove={() => onGenreChange("all")} />
            )}
            {yearFilter !== "all" && (
              <Chip label={yearFilter} onRemove={() => onYearChange("all")} />
            )}
            {ratingFilter !== "all" && (
              <Chip
                label={`${ratingFilter}★ & up`}
                onRemove={() => onRatingChange("all")}
                accent
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  onRemove,
  accent = false,
}: {
  label: string;
  onRemove: () => void;
  accent?: boolean;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors
        ${accent
          ? "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted text-foreground"
        }
      `}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}