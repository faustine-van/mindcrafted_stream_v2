import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Run all three counts in parallel — fixes the watch_status bug
  // (column is boolean `watched`, not a string status)
  const [
    { count: totalItems },
    { count: watchedItems },
    { count: favoriteItems },
  ] = await Promise.all([
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('watched', true),          // ← fixed: boolean column, not watch_status string
    supabase
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('favorite', true),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Your profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account, appearance, and personal info.
        </p>
      </div>

      <ProfileForm
        displayName={user?.user_metadata?.display_name ?? ''}
        email={user?.email ?? ''}
        createdAt={user?.created_at ?? ''}
        stats={{
          total:     totalItems     ?? 0,
          watched:   watchedItems   ?? 0,
          favorites: favoriteItems  ?? 0,
        }}
      />
    </div>
  )
}