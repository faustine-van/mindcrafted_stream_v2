'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/app/components/logo'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 grid place-items-center mx-auto">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="underline hover:text-foreground">
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 rounded-lg bg-input px-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending…' : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="inline-flex items-center gap-1 hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
