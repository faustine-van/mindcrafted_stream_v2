# Mindcrafted Stream

> A calm, focused watchlist for the things you love watching — and the ones still waiting their turn.

**Mindcrafted Stream** is a personal movie and TV show tracker built for film lovers who want a clean, distraction-free way to organize their viewing library. No social pressure, no algorithmic feeds — just your titles, your ratings, and your taste.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat&logo=supabase)](https://supabase.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01d277?style=flat)](https://www.themoviedb.org/)

---

## Features

### Unified Library
- Track movies and TV shows in one place
- Search powered by TMDB's comprehensive database
- Automatic poster, rating, and metadata fetching

### Three Simple Statuses
- **Watching** — Currently in progress
- **Watched** — Finished and done
- **Want to Watch** — On your list

### Rate & Review
- 1–5 star rating system
- Personal notes for each title
- Mark favorites with a single tap

### Smart Filtering
- Search by title, genre, or year
- Filter by status, rating, or type (movie/TV)
- Sort by date added, title, year, or rating

### Personalized Recommendations
- Algorithm based on your favorites and ratings
- Discover trending titles weekly
- Browse by genre with curated collections

### Beautiful UI
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Virtualized grid for large libraries (1000+ items)

---

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** — React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** — Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** — Headless UI components
- **[Lucide Icons](https://lucide.dev/)** — Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** — Dark mode

### Backend
- **[Supabase](https://supabase.com/)** — Auth, database, and real-time
- **[PostgreSQL](https://www.postgresql.org/)** — Database (via Supabase)
- **[TMDB API](https://www.themoviedb.org/documentation/api)** — Movie & TV data

### Deployment
- **[Vercel](https://vercel.com/)** — Hosting and CI/CD

---

## Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com/))
- TMDB API key ([get one free](https://www.themoviedb.org/settings/api))

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/mindcrafted-stream.git
cd mindcrafted-stream
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# TMDB
TMDB_API_TOKEN=your_tmdb_bearer_token
```

### 4. Set up the database
Run the Supabase migrations:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/ via Supabase dashboard
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, signup, etc.)
│   ├── (watchlist)/         # Protected pages (watchlist, discover, profile)
│   ├── api/                 # API routes (watchlist, TMDB proxy, recommendations)
│   ├── components/          # Shared app components
│   └── page.tsx             # Homepage
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Shared components (PosterRow, TrendingSection, etc.)
├── lib/
│   ├── supabase/            # Supabase client/server setup
│   ├── watchlist-actions.ts # Server actions
│   └── ...                  # Utilities and helpers
└── proxy.ts                 # Middleware (auth + routing)
```

---

## Key Features Explained

### Watchlist Management
- **Add items** — Search TMDB, select a title, set status and rating
- **Update items** — Change status, rating, notes, or favorite status
- **Delete items** — Remove titles from your library
- **Optimistic updates** — UI updates instantly, syncs in background

### Discover Page
- **Trending** — Weekly trending movies and TV shows
- **Genre browsing** — Explore by Action, Drama, Comedy, etc.
- **Quick add** — Add titles directly from discover without leaving the page

### Recommendations
- **Personalized** — Based on your favorites and highly-rated titles
- **Smart filtering** — Excludes titles already in your library
- **Weighted scoring** — Favorites count more than watched items

### Performance
- **Virtualized grid** — Handles 1000+ items smoothly
- **Optimized queries** — Parallel fetching, caching, and memoization
- **Image optimization** — Lazy loading and responsive images

---

## Authentication

Supports multiple auth methods via Supabase:
- **Email/Password** — Traditional signup and login
- **Google OAuth** — One-click sign in with Google
- **Password reset** — Email-based password recovery

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/watchlist` | GET | Fetch all watchlist items |
| `/api/watchlist` | POST | Add new item to watchlist |
| `/api/tmdb` | GET | Search, trending, or genre discovery |
| `/api/tmdb` | POST | Fetch full details for a title |
| `/api/recommendations` | GET | Get personalized recommendations |
| `/api/stats` | GET | Platform statistics (cached) |

---

## Design Philosophy

**Calm & Focused**
- No infinite scroll or algorithmic feeds
- No social features or public profiles
- No ads or tracking

**Your Library, Your Way**
- Simple 3-status system (not 10+ options)
- Clean 1–5 star ratings (not complex scoring)
- Personal notes for your own reference

**Fast & Responsive**
- Optimistic UI updates
- Virtualized rendering for large lists
- Server-side rendering for instant page loads

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables (Production)

Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TMDB_API_TOKEN`

### Supabase Configuration

Update your Supabase project settings:
- **Auth → URL Configuration** — Add your production domain
- **Auth → Redirect URLs** — Add `https://yourdomain.com/auth/callback`

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- **[TMDB](https://www.themoviedb.org/)** — Movie and TV data
- **[Supabase](https://supabase.com/)** — Backend infrastructure
- **[Vercel](https://vercel.com/)** — Hosting and deployment
- **[shadcn/ui](https://ui.shadcn.com/)** — UI component library

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Contact

Have questions or feedback? Open an issue or reach out!

---

**Built for film lovers who want a quiet place to track their stream.**
