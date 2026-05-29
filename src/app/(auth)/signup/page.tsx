'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Film, CheckCircle2, Mail } from 'lucide-react'

import { AUTH_BACKDROPS } from '../constants'

const BACKDROP = AUTH_BACKDROPS.signup

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const perks = [
  'Track movies & TV shows in one place',
  'Get personalised recommendations',
  'Rate and review what you watch',
  'Free forever — no credit card needed',
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left — cinematic panel (now 45% to give right more room) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden">
        <img src={BACKDROP} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.35) 0%, transparent 60%)' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
            <svg viewBox="0 0 64 64" className="h-5 w-5"><polygon points="24,18 24,46 48,32" fill="white"/></svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Mindcrafted Stream</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-3">Everything you need</p>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-violet-500/20 border border-violet-400/30 grid place-items-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-violet-300" />
                  </div>
                  <span className="text-white/85 text-sm">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-white/40 text-xs">Join thousands of film lovers building their personal library.</p>
        </div>
      </div>

      {/* ── Right — form (now 55%, more padding, wider form container) ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24 bg-background">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
            <Film className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Mindcrafted Stream</span>
        </div>

        {/* Max width bumped from max-w-sm (384px) to max-w-md (448px) */}
        <div className="w-full max-w-md mx-auto lg:mx-0">

          {/* ── Success state ── */}
          {done ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 grid place-items-center mx-auto">
                <Mail className="h-7 w-7 text-violet-500" />
              </div>
              <h1 className="font-serif text-2xl font-semibold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong className="text-foreground font-medium">{email}</strong>.
                Click it to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {/* Heading — slightly larger on desktop */}
              <h1 className="font-serif text-3xl lg:text-4xl font-semibold mb-1.5">Create your account</h1>
              <p className="text-sm text-muted-foreground mb-8">Start building your personal watchlist today.</p>

              {/* Google — taller button for more presence */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition flex items-center justify-center gap-2.5 mb-5"
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full h-12 rounded-xl border border-border bg-background px-4 pr-11 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(n => (
                        <div
                          key={n}
                          className={`flex-1 h-1 rounded-full transition-all ${
                            password.length >= n * 3
                              ? n <= 1 ? 'bg-red-500' : n <= 2 ? 'bg-amber-500' : n <= 3 ? 'bg-yellow-400' : 'bg-green-500'
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating account…' : <>Create account <ArrowRight className="h-4 w-4" /></>}
                </button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
                </p>
              </form>

              <p className="text-sm text-muted-foreground mt-7 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}