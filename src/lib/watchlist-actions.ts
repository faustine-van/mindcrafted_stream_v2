'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { WatchStatus } from '@/app/(watchlist)/watchlist/components/WatchCard'
import { toDbStatus } from './watchlist-utils'


// ── Actions ────────────────────────────────────────────────────────────────

export async function addToWatchlist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  if (!title?.trim()) return { error: 'Title is required' }

  const tmdbId  = formData.get('tmdb_id') as string
  const status  = formData.get('status') as WatchStatus
  const rating  = Number(formData.get('rating') || 0)
  const favorite = formData.get('favorite') === 'true'

  // Prevent duplicates
  const { data: existing } = await supabase
    .from('watchlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId)
    .single()

  if (existing) return { error: 'Already in your watchlist' }

  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      user_id:        user.id,
      tmdb_id:        tmdbId,
      title,
      original_title: (formData.get('original_title') as string) || null,
      type:           (formData.get('type') as string) || 'movie',
      genre:          (formData.get('genre') as string) || null,
      year:           (formData.get('year') as string) || null,
      release_date:   (formData.get('release_date') as string) || null,
      plot:           (formData.get('plot') as string) || null,
      poster:         (formData.get('poster') as string) || null,
      poster_small:   (formData.get('poster_small') as string) || null,
      poster_large:   (formData.get('poster_large') as string) || null,
      backdrop:       (formData.get('backdrop') as string) || null,
      tmdb_rating:    Number(formData.get('tmdb_rating') || 0),
      vote_count:     Number(formData.get('vote_count') || 0),
      popularity:     Number(formData.get('popularity') || 0),
      runtime:        Number(formData.get('runtime') || 0),
      rating,
      favorite,
      // FIX: store the real 3-way status, not just a boolean
      watch_status:   toDbStatus(status),
      watched:        status === 'Watched',  // keep boolean in sync for legacy compat
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/watchlist')
  return { id: data.id }
}

export async function updateWatchlistItem(
  id: string,
  updates: {
    status?:   WatchStatus
    rating?:   number
    favorite?: boolean
    notes?:    string   // FIX: notes now included
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const patch: Record<string, unknown> = {}

  if (updates.rating !== undefined) {
    patch.rating = updates.rating
  }

  if (updates.favorite !== undefined) {
    patch.favorite = updates.favorite
  }

  if (updates.status !== undefined) {
    // FIX: write both columns so old code and new code both work
    patch.watch_status = toDbStatus(updates.status)
    patch.watched      = updates.status === 'Watched'
  }

  // FIX: persist notes — empty string is valid (user cleared them)
  if (updates.notes !== undefined) {
    patch.notes = updates.notes.trim() || null
  }

  if (Object.keys(patch).length === 0) return { success: true }

  const { error } = await supabase
    .from('watchlist_items')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/watchlist')
  return { success: true }
}

export async function removeFromWatchlist(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/watchlist')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}