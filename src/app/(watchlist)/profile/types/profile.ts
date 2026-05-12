/* ── Types ──────────────────────────────────────────────────────────────── */
export type ProfilesProps = {
  displayName: string
  email: string
  createdAt: string
  stats: { total: number; watched: number; favorites: number }
}
export type Theme = 'light' | 'dark' | 'system'
