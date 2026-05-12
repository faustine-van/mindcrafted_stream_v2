import { TrendingSection } from "@/components/TrendingSection";
import { fetchTrending } from "@/lib/tmdb";

// ── Trending skeleton ─────────────────────────────────────────────────────────
export function TrendingSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-3" style={{ paddingLeft: "2px" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[130px] sm:w-[150px]">
          <div className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          <div className="mt-2 space-y-1.5">
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Async trending wrapper ────────────────────────────────────────────────────
export async function TrendingLoader({
  isLoggedIn,
  existingIds,
}: {
  isLoggedIn: boolean;
  existingIds: string[];
}) {
  const [trendingMovies, trendingShows] = await Promise.all([
    fetchTrending("movie"),
    fetchTrending("tv"),
  ]);
  return (
    <TrendingSection
      isLoggedIn={isLoggedIn}
      initialMovies={trendingMovies}
      initialShows={trendingShows}
      existingIds={existingIds}
    />
  );
}

// ── Stat row ──────────────────────────────────────────────────────────────────
export function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-8">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-8">
          {i > 0 && <div className="h-6 w-px bg-border" />}
          <div>
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}