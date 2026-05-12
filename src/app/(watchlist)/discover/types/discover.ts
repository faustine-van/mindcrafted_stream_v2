export interface DiscoverItem {
  tmdbId: string;
  title: string;
  type: "movie" | "tv";
  year: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  genre?: string;
}

export interface DiscoverPageData {
  isLoggedIn: boolean;
  existingIds: string[];
  trendingMovies: DiscoverItem[];
  trendingShows: DiscoverItem[];
  topRated: DiscoverItem[];
  seedTitle: {
    id: string;
    title: string;
    tmdbId: string;
    type: string;
  } | null;
}

export type MediaTab = "all" | "movie" | "tv";