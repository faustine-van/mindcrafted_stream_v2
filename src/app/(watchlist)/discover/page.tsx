import { createClient } from "@/lib/supabase/server";
import { fetchTrending } from "@/lib/tmdb";
import { unstable_cache } from "next/cache";
import { DiscoverClient } from "./DiscoverClient";
import { DiscoverItem } from "./types/discover";


const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/* ─────────────────────────────────────────
   Top-rated fetch — cached 24h across all
   visitors so it doesn't hit TMDB per request.
───────────────────────────────────────── */
const fetchTopRated = unstable_cache(
  async (): Promise<DiscoverItem[]> => {
    try {
      const res = await fetch(
        "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          next: { revalidate: 86400 },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results ?? []).slice(0, 16).map((item: any) => ({
        tmdbId:      String(item.id),
        title:       item.title ?? item.name ?? "",
        type:        "movie" as const,
        year:        (item.release_date ?? "").slice(0, 4),
        poster:      item.poster_path
          ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
          : "",
        posterSmall: item.poster_path
          ? `${TMDB_IMAGE_BASE}/w185${item.poster_path}`
          : "",
        tmdbRating:  item.vote_average ?? 0,
        genre:       "",
      }));
    } catch {
      return [];
    }
  },
  ["discover-top-rated"],
  { revalidate: 86400 }   // 24h — top rated is very stable
);

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  // All server fetches in parallel
  const [trendingMovies, trendingShows, topRated, watchlistResult] =
    await Promise.all([
      fetchTrending("movie"),
      fetchTrending("tv"),
      fetchTopRated(),
      user
        ? supabase
            .from("watchlist_items")
            .select("id, title, tmdb_id, type, watch_status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: null }),
    ]);

  const rows = (watchlistResult.data ?? []) as Array<{
    id: string;
    title: string;
    tmdb_id: string;
    type: string;
    watch_status: string | null;
    created_at: string;
  }>;

  const existingIds = rows.map((r) => r.tmdb_id).filter(Boolean);

  const seedRow =
    rows.find((r) => r.watch_status === "watching") ?? rows[0] ?? null;

  const seedTitle = seedRow
    ? {
        id:     seedRow.id,
        title:  seedRow.title,
        tmdbId: seedRow.tmdb_id,
        type:   seedRow.type,
      }
    : null;

  return (
    <DiscoverClient
      isLoggedIn={isLoggedIn}
      existingIds={existingIds}
      trendingMovies={trendingMovies as DiscoverItem[]}
      trendingShows={trendingShows as DiscoverItem[]}
      topRated={topRated}
      seedTitle={seedTitle}
    />
  );
}