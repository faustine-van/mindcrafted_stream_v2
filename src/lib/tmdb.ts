const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

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
  if (!genreIds?.length) return "";
  const map = type === "tv" ? TV_GENRE_MAP : MOVIE_GENRE_MAP;
  return genreIds.map(id => map[id] || "").filter(Boolean).join(", ");
}

function formatItem(item: any, type: string) {
  const isMovie = type === "movie";
  return {
    tmdbId: item.id?.toString() || "",
    title: isMovie ? item.title : item.name,
    type,
    year: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4) || "",
    plot: item.overview || "",
    genre: getGenreNames(item.genre_ids || [], type),
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : "",
    posterSmall: item.poster_path ? `${TMDB_IMAGE_BASE}/w185${item.poster_path}` : "",
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : "",
    tmdbRating: item.vote_average || 0,
    popularity: item.popularity || 0,
  };
}

export async function fetchTrending(type: "movie" | "tv") {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/${type}/week?language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).slice(0, 14).map((item: any) => formatItem(item, type));
  } catch {
    return [];
  }
}