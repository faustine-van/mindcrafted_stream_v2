import { createClient } from '@/lib/supabase/server'
import { WatchlistClient } from './components/WatchlistClient'
import { fetchTrending } from '@/lib/tmdb'
import type { WatchItem, WatchStatus } from '@/app/(watchlist)/watchlist/components/WatchCard'

function mapStatus(status: string | null, watched: boolean): WatchStatus {
  if (status === 'Watching') return 'Watching'
  if (status === 'Watched' || watched) return 'Watched'
  return 'Want to Watch'
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5)  return 'Late night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function getDayPeriod(): string {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const hour = new Date().getHours()
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `${day} ${period}`
}

export default async function WatchlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split('@')[0] ??
    'there'

 
  const [{ data: rows }, { data: watchlistRows }, trendingMovies] =
    await Promise.all([
      supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),

      supabase
        .from('watchlist_items')
        .select('tmdb_id')
        .eq('user_id', user!.id)
        .not('tmdb_id', 'is', null),

      fetchTrending('movie'),
    ])

  const items: WatchItem[] = (rows ?? []).map((row) => ({
    id:          row.id,
    title:       row.title,
    genre:       row.genre       ?? '',
    status:      mapStatus(row.status, row.watched),
    rating:      row.rating      ?? 0,
    poster:      row.poster      ?? '',
    backdrop:    row.backdrop    ?? '',
    type:        row.type,
    year:        row.year        ?? '',
    plot:        row.plot        ?? '',
    tmdb_id:     row.tmdb_id    ?? '',
    runtime:     row.runtime     ?? 0,
    tmdb_rating: row.tmdb_rating ?? 0,
    favorite:    row.favorite    ?? false,
    created_at:  row.created_at  ?? '',
  }))

  const existingIds = (watchlistRows ?? [])
    .map((r) => r.tmdb_id as string)
    .filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">

      {/* ── Welcome row ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] text-muted-foreground capitalize">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {getDayPeriod()}
          </span>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl font-semibold tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your personal stream — curated.
          </p>
        </div>
      </div>

      <WatchlistClient
        items={items}
        existingIds={existingIds}
        initialTrending={trendingMovies}
      />

    </div>
  )
}