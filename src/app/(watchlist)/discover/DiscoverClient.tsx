"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { PosterRow } from "@/components/PosterRow";
import { SectionHeader } from "./components/SectionHeader";
import { DiscoverItem, DiscoverPageData, MediaTab } from "./types/discover";
import { GenreLabel, GENRES } from "./constants/genres";
import { RowSkeleton } from "./components/helpers";
import { Footer } from "@/app/components/Footer";



export function DiscoverClient({
  isLoggedIn,
  existingIds,
  trendingMovies,
  trendingShows,
  topRated,
  seedTitle,
}: DiscoverPageData) {
  const router = useRouter();

  const [addedIds, setAddedIds]   = useState<Set<string>>(new Set(existingIds));
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [mediaTab, setMediaTab]       = useState<MediaTab>("all");
  const [activeGenre, setActiveGenre] = useState<GenreLabel | null>(null);

  const [genreItems, setGenreItems]     = useState<DiscoverItem[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);

  const [seededRecs, setSeededRecs]         = useState<DiscoverItem[]>([]);
  const [seededLoading, setSeededLoading]   = useState(!!seedTitle);
  const [seededFetched, setSeededFetched]   = useState(false);

  // ── Add to watchlist ──────────────────────────────────────────────
  const handleAdd = useCallback(
    async (item: DiscoverItem) => {
      if (!isLoggedIn) { router.push("/signup"); return; }
      if (addedIds.has(item.tmdbId) || loadingId) return;

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
          setAddedIds((prev) => new Set([...prev, item.tmdbId]));
        }
      } catch {
        // button stays interactive, user can retry
      } finally {
        setLoadingId(null);
      }
    },
    [isLoggedIn, addedIds, loadingId, router]
  );

  // ── Seeded recommendations (logged-in, on mount) ──────────────────
  useEffect(() => {
    if (!seedTitle || seededFetched) return;
    setSeededFetched(true);

    fetch(
      `/api/recommendations?tmdb_id=${seedTitle.tmdbId}&type=${seedTitle.type}&limit=14`,
      { credentials: "include" }
    )
      .then((r) => r.json())
      .then((d) => setSeededRecs(d.results ?? []))
      .catch(() => setSeededRecs([]))
      .finally(() => setSeededLoading(false));
  }, [seedTitle, seededFetched]);

  // ── Genre row — fetches when genre or media tab changes ───────────
  useEffect(() => {
    if (!activeGenre) { setGenreItems([]); return; }

    const genre = GENRES.find((g) => g.label === activeGenre);
    if (!genre) return;

    const type    = mediaTab === "tv" ? "tv" : "movie";
    const genreId = type === "tv" ? genre.tvId : genre.movieId;

    if (!genreId) {
      setGenreItems([]);
      setGenreLoading(false);
      return;
    }

    setGenreLoading(true);
    setGenreItems([]);


    fetch(
      `/api/tmdb?genre_id=${genreId}&type=${type}&limit=16`,
      { credentials: "include" }
    )
      .then((r) => r.json())
      .then((d) => setGenreItems(d.results ?? []))
      .catch(() => setGenreItems([]))
      .finally(() => setGenreLoading(false));
  }, [activeGenre, mediaTab]);

  const trendingItems = mediaTab === "tv" ? trendingShows : trendingMovies;

  const addLabel = (item: DiscoverItem) =>
    addedIds.has(item.tmdbId)
      ? "Added to watchlist"
      : isLoggedIn
      ? "Add to watchlist"
      : "Sign up to add";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-12">

      {/* ── Page header ── */}
      <div className="space-y-4">
        <Link
          href="/watchlist"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to watchlist
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl grid place-items-center shrink-0 bg-violet-500/10 text-violet-500">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
                Discover
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Find your next watch
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Media tabs */}
            <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
              {(["all", "movie", "tv"] as MediaTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMediaTab(t)}
                  className={`h-7 px-3 rounded-md text-xs font-medium transition-all ${
                    mediaTab === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "All" : t === "movie" ? "Movies" : "TV"}
                </button>
              ))}
            </div>

            {/* Genre chips */}
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const isActive    = activeGenre === g.label;
                const unavailable = mediaTab === "tv" && g.tvId === null;
                return (
                  <button
                    key={g.label}
                    type="button"
                    disabled={unavailable}
                    onClick={() => setActiveGenre(isActive ? null : g.label)}
                    className={`h-7 px-3 rounded-full text-xs font-medium border transition-all ${
                      unavailable
                        ? "opacity-30 cursor-not-allowed border-border text-muted-foreground"
                        : isActive
                        ? "bg-violet-500/10 border-violet-500/40 text-violet-600 dark:text-violet-400"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trending ── */}
      <section>
        <SectionHeader
          title="Trending this week"
          subtitle={
            mediaTab === "tv"
              ? "Most-watched TV shows right now"
              : "Most-watched movies right now"
          }
        />
        <PosterRow
          items={trendingItems}
          onAdd={handleAdd}
          addedIds={[...addedIds]}
          loadingId={loadingId}
          getAddLabel={addLabel}
        />
      </section>

      {/* ── Genre row (only when a genre is selected) ── */}
      {activeGenre && (
        <section>
          <SectionHeader
            title={`Top ${activeGenre} ${mediaTab === "tv" ? "shows" : "movies"}`}
            subtitle={`Highest-rated ${activeGenre.toLowerCase()} titles`}
            action={
              <button
                type="button"
                onClick={() => setActiveGenre(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            }
          />
          {genreLoading ? (
            <RowSkeleton />
          ) : genreItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No results for {activeGenre}{" "}
              {mediaTab === "tv" ? "TV shows" : "movies"}.
            </p>
          ) : (
            <PosterRow
              items={genreItems}
              onAdd={handleAdd}
              addedIds={[...addedIds]}
              loadingId={loadingId}
              getAddLabel={addLabel}
            />
          )}
        </section>
      )}

      {/* ── Top rated ── */}
      {topRated.length > 0 && (
        <section>
          <SectionHeader
            title="Top rated all time"
            subtitle="TMDB's highest-rated movies"
          />
          <PosterRow
            items={topRated}
            onAdd={handleAdd}
            addedIds={[...addedIds]}
            loadingId={loadingId}
            getAddLabel={addLabel}
          />
        </section>
      )}

      {/* ── Because you watched X (logged-in + seed exists) ── */}
      {isLoggedIn && seedTitle && (
        <section>
          <SectionHeader
            title={`Because you watched ${seedTitle.title}`}
            subtitle="Titles similar to what you're into"
          />
          {seededLoading ? (
            <RowSkeleton />
          ) : seededRecs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No recommendations yet — add more titles to your watchlist.
            </p>
          ) : (
            <PosterRow
              items={seededRecs}
              onAdd={handleAdd}
              addedIds={[...addedIds]}
              loadingId={loadingId}
              getAddLabel={addLabel}
            />
          )}
        </section>
      )}

      {/* ── Nudge for logged-out users ── */}
      {!isLoggedIn && (
        <section className="rounded-2xl border border-dashed border-border bg-card/40 px-8 py-12 text-center space-y-3">
          <p className="font-semibold text-sm">Get personalised recommendations</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Sign in and add a few titles — we'll show you what to watch next based on your taste.
          </p>
          <div className="flex gap-2 justify-center pt-1">
            <Link
              href="/signup"
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition inline-flex items-center gap-1.5"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-muted transition"
            >
              Sign in
            </Link>
          </div>
        </section>
      )}

    <Footer isLoggedIn={isLoggedIn} />

    </div>
  );
}