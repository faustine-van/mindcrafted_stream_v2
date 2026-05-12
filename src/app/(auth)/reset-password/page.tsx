'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/app/components/logo'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/watchlist')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h1 className="text-xl font-semibold">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-10 rounded-lg bg-input px-3 pr-10 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 rounded-lg bg-input px-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Updating…' : <>Update password <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="hover:text-foreground transition">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
