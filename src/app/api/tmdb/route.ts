import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const TMDB_HEADERS = {
  Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
  "Content-Type": "application/json",
};

const MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const TV_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 10762: "Kids",
  9648: "Mystery", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics", 37: "Western",
};

function getGenreNames(genreIds: number[], type: string): string {
  if (!genreIds || genreIds.length === 0) return "";
  const map = type === "tv" ? TV_GENRE_MAP : MOVIE_GENRE_MAP;
  return genreIds.map(id => map[id] || "Unknown").join(", ");
}

function formatTMDBResponse(item: any, type: string) {
  const isMovie = type === "movie";
  return {
    tmdbId:           item.id?.toString() || "",
    title:            isMovie ? item.title : item.name,
    originalTitle:    isMovie ? item.original_title : item.original_name,
    type,
    year:             isMovie
                        ? item.release_date?.substring(0, 4) || ""
                        : item.first_air_date?.substring(0, 4) || "",
    releaseDate:      isMovie ? item.release_date : item.first_air_date,
    plot:             item.overview || "",
    genre:            getGenreNames(item.genre_ids || [], type),
    poster:           item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : "",
    posterSmall:      item.poster_path ? `${TMDB_IMAGE_BASE}/w185${item.poster_path}` : "",
    posterLarge:      item.poster_path ? `${TMDB_IMAGE_BASE}/w780${item.poster_path}` : "",
    backdrop:         item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : "",
    backdropSmall:    item.backdrop_path ? `${TMDB_IMAGE_BASE}/w780${item.backdrop_path}` : "",
    tmdbRating:       item.vote_average || 0,
    voteCount:        item.vote_count || 0,
    popularity:       item.popularity || 0,
    adult:            item.adult || false,
    originalLanguage: item.original_language || "en",
  };
}

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * GET /api/tmdb
 *
 * Modes (mutually exclusive, checked in order):
 *
 * 1. Genre discovery
 *    ?genre_id=28&type=movie|tv&limit=16
 *    Calls TMDB /discover sorted by vote_average desc.
 *    Used by the Discover page genre chips.
 *
 * 2. Trending
 *    ?trending=true&type=movie|tv
 *    Calls TMDB /trending/{type}/week.
 *
 * 3. Search
 *    ?q=inception&type=movie|tv&page=1
 *    Calls TMDB /search/{type}.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const type    = searchParams.get("type") || "movie";
  const page    = searchParams.get("page") || "1";
  const query   = searchParams.get("q");
  const trending = searchParams.get("trending") === "true";
  const genreId  = searchParams.get("genre_id");
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "16"), 40);

  if (type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "Type must be 'movie' or 'tv'" }, { status: 400 });
  }

  try {
    let url: string;

    if (genreId) {
      // ── Mode 1: Genre discovery ──────────────────────────────────
      // TMDB /discover with genre filter, sorted by rating.
      // vote_count.gte=200 filters out obscure low-vote titles.
      const endpoint = new URL(`${TMDB_BASE_URL}/discover/${type}`);
      endpoint.searchParams.set("with_genres",    genreId);
      endpoint.searchParams.set("sort_by",        "vote_average.desc");
      endpoint.searchParams.set("vote_count.gte", "200");
      endpoint.searchParams.set("language",       "en-US");
      endpoint.searchParams.set("page",           "1");
      url = endpoint.toString();
    } else if (trending) {
      // ── Mode 2: Trending ─────────────────────────────────────────
      url = `${TMDB_BASE_URL}/trending/${type}/week?language=en-US`;
    } else {
      // ── Mode 3: Search ───────────────────────────────────────────
      if (!query) {
        return NextResponse.json({ error: "Search query required" }, { status: 400 });
      }
      url = `${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`;
    }

    const response = await fetch(url, {
      headers: TMDB_HEADERS,
      next: { revalidate: genreId ? 3600 : 3600 }, // 1h cache for all modes
    });

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded, try again shortly" },
        { status: 429 }
      );
    }
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: "TMDB API error", details: error.status_message },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Apply limit for genre/trending modes; search returns full page.
    const raw = genreId
      ? (data.results ?? []).slice(0, limit)
      : (data.results ?? []);

    const results = raw.map((item: any) => formatTMDBResponse(item, type));

    return NextResponse.json({
      results,
      page:         data.page,
      totalPages:   data.total_pages,
      totalResults: data.total_results,
    });
  } catch (error) {
    console.error("TMDB GET error:", error);
    return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 500 });
  }
}

/**
 * POST /api/tmdb
 * Body: { tmdbId: string, type: 'movie' | 'tv' }
 * Returns full detail for a single title including cast, crew, videos, recommendations.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { tmdbId, type = "movie" } = body;

    if (!tmdbId) {
      return NextResponse.json({ error: "TMDB ID required" }, { status: 400 });
    }
    if (type !== "movie" && type !== "tv") {
      return NextResponse.json({ error: "Type must be 'movie' or 'tv'" }, { status: 400 });
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/${type}/${tmdbId}?language=en-US&append_to_response=credits,videos,external_ids,keywords,recommendations`,
      { headers: TMDB_HEADERS, next: { revalidate: 3600 } }
    );

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded, try again shortly" },
        { status: 429 }
      );
    }
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch details", details: error.status_message },
        { status: response.status }
      );
    }

    const data = await response.json();
    const isMovie = type === "movie";

    return NextResponse.json({
      tmdbId:             data.id?.toString() || "",
      imdbId:             data.external_ids?.imdb_id || "",
      title:              isMovie ? data.title : data.name,
      originalTitle:      isMovie ? data.original_title : data.original_name,
      type,
      year:               isMovie
                            ? data.release_date?.substring(0, 4) || ""
                            : data.first_air_date?.substring(0, 4) || "",
      releaseDate:        isMovie ? data.release_date : data.first_air_date,
      plot:               data.overview || "",
      tagline:            data.tagline || "",
      genres:             data.genres || [],
      genre:              data.genres?.map((g: any) => g.name).join(", ") || "",
      poster:             data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : "",
      posterSmall:        data.poster_path ? `${TMDB_IMAGE_BASE}/w185${data.poster_path}` : "",
      posterLarge:        data.poster_path ? `${TMDB_IMAGE_BASE}/w780${data.poster_path}` : "",
      backdrop:           data.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${data.backdrop_path}` : "",
      backdropSmall:      data.backdrop_path ? `${TMDB_IMAGE_BASE}/w780${data.backdrop_path}` : "",
      tmdbRating:         data.vote_average || 0,
      voteCount:          data.vote_count || 0,
      popularity:         data.popularity || 0,
      runtime:            data.runtime || data.episode_run_time?.[0] || 0,
      status:             data.status || "",
      originalLanguage:   data.original_language || "en",
      budget:             data.budget || 0,
      revenue:            data.revenue || 0,
      cast: data.credits?.cast?.slice(0, 10).map((p: any) => ({
        id:          p.id,
        name:        p.name,
        character:   p.character,
        profilePath: p.profile_path ? `${TMDB_IMAGE_BASE}/w185${p.profile_path}` : null,
      })) || [],
      crew: data.credits?.crew
        ?.filter((p: any) => ["Director", "Writer", "Screenplay"].includes(p.job))
        .map((p: any) => ({
          id:          p.id,
          name:        p.name,
          job:         p.job,
          profilePath: p.profile_path ? `${TMDB_IMAGE_BASE}/w185${p.profile_path}` : null,
        })) || [],
      videos: data.videos?.results
        ?.filter((v: any) => v.site === "YouTube" && ["Trailer", "Teaser"].includes(v.type))
        .map((v: any) => ({
          id:         v.id,
          key:        v.key,
          name:       v.name,
          type:       v.type,
          youtubeUrl: `https://www.youtube.com/watch?v=${v.key}`,
          embedUrl:   `https://www.youtube.com/embed/${v.key}`,
        })) || [],
      keywords:           data.keywords?.keywords || data.keywords?.results || [],
      recommendations:    data.recommendations?.results?.slice(0, 5).map(
                            (i: any) => formatTMDBResponse(i, type)
                          ) || [],
      productionCompanies: data.production_companies || [],
      productionCountries: data.production_countries || [],
    });
  } catch (error) {
    console.error("TMDB POST error:", error);
    return NextResponse.json({ error: "Failed to fetch details from TMDB" }, { status: 500 });
  }
}