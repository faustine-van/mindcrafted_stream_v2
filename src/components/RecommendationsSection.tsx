"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PosterRow } from "@/components/PosterRow";

interface RecommendedItem {
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
  existingIds: string[];
}

function PosterSkeleton() {
  return (
    <div className="shrink-0 w-[130px] sm:w-[150px]">
      <div className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function RecommendationsSection({ existingIds }: Props) {
  const [items, setItems] = useState<RecommendedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  // Seed addedIds from the server-provided list — no client fetch for IDs.
  const [addedIds, setAddedIds] = useState<string[]>(existingIds);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fetch recommendation results only (not user's existing IDs).
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/recommendations?limit=14", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.results?.length) {
          setIsEmpty(true);
          return;
        }
        setItems(data.results);
      } catch {
        setIsEmpty(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleAdd(item: RecommendedItem) {
    if (addedIds.includes(item.tmdbId) || loadingId) return;
    setLoadingId(item.tmdbId);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title:        item.title,
          type:         item.type,
          genre:        item.genre ?? "",
          year:         item.year,
          tmdb_id:      item.tmdbId,
          poster:       item.poster,
          poster_small: item.posterSmall,
          tmdb_rating:  item.tmdbRating,
          watched:      false,
          favorite:     false,
        }),
      });
      if (res.ok) {
        setAddedIds((prev) => [...prev, item.tmdbId]);
      }
    } catch {
      // ignore — button stays interactive so the user can retry
    } finally {
      setLoadingId(null);
    }
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-2xl">
        <div className="h-12 w-12 rounded-2xl bg-pink-500/10 grid place-items-center mb-3">
          <Sparkles className="h-5 w-5 text-pink-500" />
        </div>
        <p className="font-medium text-sm mb-1">No recommendations yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Add some favorites or mark things as watched — we&apos;ll suggest what to watch next.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden pb-3" style={{ paddingLeft: "2px" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <PosterRow
      items={items}
      onAdd={handleAdd}
      addedIds={addedIds}
      loadingId={loadingId}
    />
  );
}