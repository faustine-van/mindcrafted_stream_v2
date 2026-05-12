import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

/**
 * GET /api/watchlist
 * Returns all watchlist items for the logged-in user.
 * Used by useWatchlist hook to refresh client-side state.
 */
export async function GET() {
  const { user, supabase } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * POST /api/watchlist
 * Adds a single item to the watchlist.
 * Used by TrendingSection and RecommendationsSection quick-add buttons.
 *
 * Body shape (all fields sent by TrendingSection / RecommendationsSection):
 * {
 *   title, type, genre, year, tmdb_id,
 *   poster, poster_small, tmdb_rating,
 *   watched, favorite
 * }
 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, type, genre, year, tmdb_id, poster, poster_small, tmdb_rating, watched, favorite } = body;

  if (!title || !tmdb_id) {
    return NextResponse.json({ error: "title and tmdb_id are required" }, { status: 400 });
  }

  // Prevent duplicates silently — return 200 so the UI can still mark it as added
  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("tmdb_id", tmdb_id)
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({
      user_id: user.id,
      title,
      type: type ?? "movie",
      genre: genre ?? null,
      year: year ?? null,
      tmdb_id,
      poster: poster ?? null,
      poster_small: poster_small ?? null,
      tmdb_rating: tmdb_rating ?? 0,
      watched: watched ?? false,
      favorite: favorite ?? false,
      rating: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data });
}