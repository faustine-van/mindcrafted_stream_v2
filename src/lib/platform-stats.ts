import { createClient as createServiceClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export interface PlatformStats {
  titlesTracked: number;
  totalUsers: number;
  avgRating: number;
}

// once per hour across all visitors, not on every page load.
const _getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const [
      { count: titlesCount },
      { data: usersData },
      { data: ratingsData },
    ] = await Promise.all([
      supabase
        .from("watchlist_items")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("watchlist_items")
        .select("user_id"),
      supabase
        .from("watchlist_items")
        .select("rating")
        .gt("rating", 0),
    ]);

    const uniqueUsers = new Set(usersData?.map((r) => r.user_id) ?? []).size;

    const ratings = ratingsData?.map((r) => r.rating as number) ?? [];
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return {
      titlesTracked: titlesCount ?? 0,
      totalUsers: uniqueUsers,
      avgRating,
    };
  },
  ["platform-stats"],          // cache key
  { revalidate: 3600 }         // refresh at most once per hour
);

export async function getPlatformStats(): Promise<PlatformStats> {
  return _getPlatformStats();
}

export function formatStat(n: number): string {
  if (n >= 10_000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1_000)  return `${(n / 1000).toFixed(1).replace(".0", "")}k+`;
  return String(n);
}

export function formatRating(avg: number): string {
  if (avg === 0) return "—";
  return `${avg.toFixed(1)}★`;
}