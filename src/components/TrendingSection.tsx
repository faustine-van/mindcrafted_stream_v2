"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PosterRow } from "@/components/PosterRow";

interface TrendingItem {
  tmdbId: string;
  title: string;
  type: string;
  year: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  genre: string;
}

interface Props {
  isLoggedIn?: boolean;
  initialMovies: TrendingItem[];
  initialShows: TrendingItem[];
  existingIds: string[];
}

export function TrendingSection({
  isLoggedIn,
  initialMovies,
  initialShows,
  existingIds,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"movie" | "tv">("movie");
  const [addedIds, setAddedIds] = useState<string[]>(existingIds);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAdd(item: TrendingItem) {
    if (!isLoggedIn) { router.push("/signup"); return; }
    if (addedIds.includes(item.tmdbId) || loadingId) return;

    setLoadingId(item.tmdbId);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title:       item.title,
          type:        item.type,
          genre:       item.genre,
          year:        item.year,
          tmdb_id:     item.tmdbId,
          poster:      item.poster,
          poster_small: item.posterSmall,
          tmdb_rating: item.tmdbRating,
          watched:     false,
          favorite:    false,
        }),
      });
      if (!res.ok) {
        console.error("Watchlist POST failed:", res.status);
        return;
      }
      // Optimistically mark as added — no page refresh required.
      setAddedIds((prev) => [...prev, item.tmdbId]);
    } catch (e) {
      console.error("Watchlist POST error:", e);
    } finally {
      setLoadingId(null);
    }
  }

  const items = tab === "movie" ? initialMovies : initialShows;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["movie", "tv"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-8 px-4 rounded-lg text-xs font-medium border transition-all ${
              tab === t
                ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "movie" ? "Movies" : "TV Shows"}
          </button>
        ))}
      </div>

      <PosterRow
        items={items}
        onAdd={handleAdd}
        addedIds={addedIds}
        loadingId={loadingId}
        getAddLabel={(item) =>
          addedIds.includes(item.tmdbId)
            ? "Added to watchlist"
            : isLoggedIn
            ? "Add to watchlist"
            : "Sign up to add"
        }
      />
    </div>
  );
}