"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search, Loader2, Film, Tv, ChevronLeft, Star, Plus,
} from "lucide-react";
import type { WatchItem, WatchStatus } from "@/app/(watchlist)/watchlist/components/WatchCard";
import { addToWatchlist } from "@/lib/watchlist-actions";

interface TmdbResult {
  tmdbId: string;
  title: string;
  year: string;
  type: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  plot: string;
  genre: string;
}

type Step = "search" | "results" | "form";
type SearchType = "movie" | "tv";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the optimistic WatchItem after a successful add */
  onAdded?: (item: WatchItem) => void;
}

const STATUS_OPTIONS: WatchStatus[] = ["Want to Watch", "Watching", "Watched"];

export function AddItemModal({ open, onOpenChange, onAdded }: Props) {
  const [step, setStep] = useState<Step>("search");
  const [searchType, setSearchType] = useState<SearchType>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [status, setStatus] = useState<WatchStatus>("Want to Watch");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const queryRef = useRef(query);
  useEffect(() => { queryRef.current = query; }, [query]);

  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);

  function reset() {
    abortRef.current?.abort();
    setStep("search");
    setQuery("");
    setResults([]);
    setSelected(null);
    setStatus("Want to Watch");
    setRating(0);
    setFavorite(false);
  }

  function handleClose(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  const handleSearch = useCallback(async () => {
    const q = queryRef.current.trim();
    if (!q) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setResults([]);

    try {
      const res = await fetch(
        `/api/tmdb?q=${encodeURIComponent(q)}&type=${searchType}`,
        { credentials: "include", signal: controller.signal }
      );

      if (res.status === 401) {
        toast.error("Session expired — please refresh and log in again.");
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.results?.length) {
        toast.error(`Nothing found for "${q}".`);
        return;
      }

      setResults(data.results);
      setStep("results");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Could not reach TMDB. Check your connection.");
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchType]);

  async function handleSelectResult(result: TmdbResult) {
    setLoadingId(result.tmdbId);
    try {
      const res = await fetch("/api/tmdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tmdbId: result.tmdbId, type: searchType }),
      });

      if (res.status === 401) {
        toast.error("Session expired — please refresh and log in again.");
        return;
      }

      const detail = await res.json();
      setSelected({
        ...result,
        genre: detail.genre || result.genre,
        plot: detail.plot || result.plot,
      });
      setStep("form");
    } catch {
      setSelected(result);
      setStep("form");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("query", selected.title);
      formData.set("type", searchType);
      formData.set("status", status);
      formData.set("tmdb_id", selected.tmdbId);

      const result = await addToWatchlist(formData);
      if (result?.error) throw new Error(result.error);

      toast.success(`${selected.title} added to your watchlist.`);

      const optimisticItem: WatchItem = {
        id: (result && 'id' in result) ? result.id : `optimistic-${Date.now()}`,
        title:       selected.title,
        genre:       selected.genre     ?? "",
        status,
        rating,
        poster:      selected.poster    ?? "",
        backdrop:    "",
        type:        searchType === "tv" ? "tv" : "movie",
        year:        selected.year      ?? "",
        plot:        selected.plot      ?? "",
        tmdb_id:     selected.tmdbId    ?? "",
        runtime:     0,
        tmdb_rating: selected.tmdbRating ?? 0,
        favorite,
      };

      onAdded?.(optimisticItem);
      handleClose(false);
    } catch (err: any) {
      toast.error(err.message || "Could not add item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const titleMap: Record<Step, string> = {
    search:  "Add to Watchlist",
    results: `Results for "${query}"`,
    form:    "Confirm & Add",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "search" && (
              <button
                onClick={() => setStep(step === "form" ? "results" : "search")}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {titleMap[step]}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Search ── */}
        {step === "search" && (
          <div className="space-y-5 py-2">
            <div className="flex gap-2">
              {(["movie", "tv"] as SearchType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSearchType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                    searchType === t
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "movie" ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                  {t === "movie" ? "Movies" : "TV Shows"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder={`Search ${searchType === "movie" ? "movies" : "TV shows"}…`}
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="h-10 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Powered by TMDB — the world's most comprehensive movie database
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Results ── */}
        {step === "results" && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} — pick the one you want
            </p>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {results.map((result) => (
                <button
                  key={result.tmdbId}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  disabled={!!loadingId}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-accent/60 hover:bg-muted/50 transition-all text-left group disabled:opacity-50"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {result.posterSmall || result.poster ? (
                      <img
                        src={result.posterSmall || result.poster}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                      {result.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{result.year}</span>
                      {result.tmdbRating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {result.tmdbRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {result.genre && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{result.genre}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {loadingId === result.tmdbId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep("search")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm form ── */}
        {step === "form" && selected && (
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <div className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
              {selected.poster && (
                <img
                  src={selected.poster}
                  alt={selected.title}
                  className="w-14 h-20 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-snug">{selected.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.year} · {searchType === "tv" ? "TV Show" : "Movie"}
                </p>
                {selected.tmdbRating > 0 && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {selected.tmdbRating.toFixed(1)} TMDB
                  </p>
                )}
                {selected.plot && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {selected.plot}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                      status === s
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your rating</label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1 === rating ? 0 : i + 1)}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        i < (hoveredRating || rating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {rating > 0 ? `${rating}/5` : "Not rated"}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500"
              />
              <span className="text-sm">Add to favorites</span>
            </label>

            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={() => setStep("results")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Adding…" : "Add to Watchlist"}
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}