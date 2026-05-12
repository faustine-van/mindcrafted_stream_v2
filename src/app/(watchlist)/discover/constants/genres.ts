export const GENRES = [
  { label: "Action",      movieId: 28,    tvId: 10759 },
  { label: "Comedy",      movieId: 35,    tvId: 35    },
  { label: "Drama",       movieId: 18,    tvId: 18    },
  { label: "Thriller",    movieId: 53,    tvId: null  },
  { label: "Sci-Fi",      movieId: 878,   tvId: 10765 },
  { label: "Horror",      movieId: 27,    tvId: null  },
  { label: "Documentary", movieId: 99,    tvId: 99    },
  { label: "Animation",   movieId: 16,    tvId: 16    },
  { label: "Romance",     movieId: 10749, tvId: null  },
  { label: "Crime",       movieId: 80,    tvId: 80    },
] as const;

export type GenreLabel = (typeof GENRES)[number]["label"];