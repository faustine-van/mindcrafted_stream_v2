import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

function tmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

function formatItem(item: any, type: string) {
  const isMovie = type === 'movie'
  return {
    tmdbId: item.id?.toString() || '',
    title: isMovie ? item.title : item.name,
    type,
    year: (isMovie ? item.release_date : item.first_air_date)?.substring(0, 4) || '',
    plot: item.overview || '',
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : '',
    tmdbRating: item.vote_average || 0,
    popularity: item.popularity || 0,
  }
}

export async function GET(request: Request) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 40)
  const typeFilter = searchParams.get('type') // 'movie' | 'tv' | null (both)

  // 2. Fetch user's watchlist — favorites + watched, with ratings
  let query = supabase
    .from('watchlist_items')
    .select('tmdb_id, type, title, favorite, watched, rating, tmdb_rating, created_at')
    .eq('user_id', user.id)
    .not('tmdb_id', 'is', null)
    .or('favorite.eq.true,watched.eq.true')
    .order('created_at', { ascending: false })
    .limit(50)

  if (typeFilter) query = query.eq('type', typeFilter)

  const { data: watchlistItems, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
  if (!watchlistItems || watchlistItems.length === 0) {
    return NextResponse.json({ results: [], message: 'Add some favorites or watched items to get recommendations' })
  }

  // 3. Score and pick seeds
  // Scoring: favorite=3pts, user rating 4-5=2pts, watched=1pt, recency bonus
  const scored = watchlistItems.map((item, index) => {
    let score = 0
    if (item.favorite) score += 3
    if (item.rating && item.rating >= 4) score += 2
    else if (item.rating && item.rating === 3) score += 1
    if (item.watched) score += 1
    score += Math.max(0, (50 - index) / 50) // recency bonus (0-1)
    return { ...item, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Pick top 5 seeds
  const seeds = scored.slice(0, 5)

  // 4. Fetch TMDB recommendations for each seed in parallel
  const allRecommendations = await Promise.allSettled(
    seeds.map(seed =>
      fetch(`${TMDB_BASE_URL}/${seed.type}/${seed.tmdb_id}/recommendations?language=en-US&page=1`, {
        headers: tmdbHeaders(),
        next: { revalidate: 3600 },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => data?.results?.map((item: any) => formatItem(item, seed.type)) || [])
    )
  )

  // 5. Collect all results
  const rawResults: any[] = []
  allRecommendations.forEach(result => {
    if (result.status === 'fulfilled') {
      rawResults.push(...result.value)
    }
  })

  // 6. Build a set of tmdb_ids already in the user's watchlist
  const { data: allWatchlistIds } = await supabase
    .from('watchlist_items')
    .select('tmdb_id')
    .eq('user_id', user.id)
    .not('tmdb_id', 'is', null)

  const existingIds = new Set(allWatchlistIds?.map(i => i.tmdb_id) || [])

  // 7. Deduplicate + filter out what they already have
  const seen = new Set<string>()
  const filtered = rawResults.filter(item => {
    if (!item.tmdbId) return false
    if (existingIds.has(item.tmdbId)) return false
    if (seen.has(item.tmdbId)) return false
    seen.add(item.tmdbId)
    return true
  })

  // 8. Sort by TMDB rating + popularity, take limit
  filtered.sort((a, b) => {
    const scoreA = (a.tmdbRating * 10) + Math.log(a.popularity + 1)
    const scoreB = (b.tmdbRating * 10) + Math.log(b.popularity + 1)
    return scoreB - scoreA
  })

  const results = filtered.slice(0, limit)

  return NextResponse.json({
    results,
    seedCount: seeds.length,
    seeds: seeds.map(s => ({ title: s.title, type: s.type, score: s.score })),
  })
}
