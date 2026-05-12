"use client";

import { useRef } from "react";
import { Search, SlidersHorizontal, Plus, X, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortOption } from "./use-watchlist";

interface Props {
  searchQuery: string;
  sortBy: SortOption;
  showFilters: boolean;
  activeFiltersCount: number;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onToggleFilters: () => void;
  onAddNew: () => void;
}

const SORT_GROUPS = [
  {
    label: "Date",
    options: [
      { value: "date-desc", label: "Newest first" },
      { value: "date-asc",  label: "Oldest first" },
    ],
  },
  {
    label: "Title",
    options: [
      { value: "title-asc",  label: "A → Z" },
      { value: "title-desc", label: "Z → A" },
    ],
  },
  {
    label: "Year",
    options: [
      { value: "year-desc", label: "Newest" },
      { value: "year-asc",  label: "Oldest" },
    ],
  },
  {
    label: "Rating",
    options: [
      { value: "rating-desc",      label: "My rating — high to low" },
      { value: "rating-asc",       label: "My rating — low to high" },
      { value: "tmdb-rating-desc", label: "TMDB score" },
    ],
  },
] as const;

const SORT_LABEL: Record<SortOption, string> = {
  "date-desc":        "Newest",
  "date-asc":         "Oldest",
  "title-asc":        "A → Z",
  "title-desc":       "Z → A",
  "year-desc":        "Year ↓",
  "year-asc":         "Year ↑",
  "rating-desc":      "Rating ↓",
  "rating-asc":       "Rating ↑",
  "tmdb-rating-desc": "TMDB",
};

export function WatchlistToolbar({
  searchQuery, sortBy, showFilters, activeFiltersCount,
  onSearchChange, onSortChange, onToggleFilters, onAddNew,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">

      {/* ── Search ── */}
      <div
        className="relative flex-1 flex items-center group"
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-150 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search titles, genres, years…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full h-10 pl-10 pr-9 rounded-xl
            border border-border bg-card/60 backdrop-blur-sm
            text-sm placeholder:text-muted-foreground/60
            outline-none transition-all duration-150
            focus:border-accent/50 focus:bg-card focus:ring-2 focus:ring-accent/10
            hover:border-border/80
          "
        />
        {searchQuery && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSearchChange(""); }}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-2">

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="
                h-10 px-3.5 rounded-xl border border-border bg-card/60 backdrop-blur-sm
                text-sm text-muted-foreground hover:text-foreground hover:bg-card
                flex items-center gap-2 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30
              "
            >
              <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline font-medium">{SORT_LABEL[sortBy]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) => onSortChange(v as SortOption)}
            >
              {SORT_GROUPS.map((group, gi) => (
                <div key={group.label}>
                  {gi > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 px-2 py-1">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.options.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </div>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filters toggle */}
        <button
          type="button"
          onClick={onToggleFilters}
          className={`
            relative h-10 px-3.5 rounded-xl border text-sm font-medium
            flex items-center gap-2 transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30
            ${showFilters
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-card/60 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-card"
            }
          `}
          aria-pressed={showFilters}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Filters</span>
          {/* Active count bubble */}
          {activeFiltersCount > 0 && (
            <span className="
              absolute -top-1.5 -right-1.5
              h-4 w-4 rounded-full text-[9px] font-bold
              flex items-center justify-center
              bg-accent text-accent-foreground
              ring-2 ring-background
            ">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Add button */}
        <button
          type="button"
          onClick={onAddNew}
          className="
            h-10 px-4 rounded-xl
            bg-accent text-accent-foreground
            text-sm font-semibold
            flex items-center gap-1.5
            hover:opacity-90 active:scale-[0.97]
            transition-all duration-150
            shadow-sm shadow-accent/20
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
          "
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  );
}