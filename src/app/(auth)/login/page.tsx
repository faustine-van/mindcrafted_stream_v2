'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Film } from 'lucide-react'

const BACKDROP = 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg'

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/watchlist')
    router.refresh()
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

      {/* Left — cinematic panel (45%, identical to signup) */}
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

        <div className="relative z-10 space-y-3">
          <blockquote className="font-serif text-3xl font-semibold text-white leading-tight">
            "Every great film<br/>begins with a single<br/>moment of wonder."
          </blockquote>
          <p className="text-white/50 text-sm">Your personal library, curated.</p>
        </div>
      </div>

      {/* Right — form (flex-1 = 55%, identical structure to signup) */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24 bg-background">

        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}>
            <Film className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Mindcrafted Stream</span>
        </div>

        {/* max-w-md + lg:mx-0 — identical to signup */}
        <div className="w-full max-w-lg mx-auto lg:mx-0">

          <h1 className="font-serif text-3xl lg:text-4xl font-semibold mb-1.5">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to continue to your stream.</p>

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

          <form onSubmit={handleLogin} className="space-y-5">

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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              {loading ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>

          </form>

          <p className="text-sm text-muted-foreground mt-7 text-center">
            New here?{' '}
            <Link href="/signup" className="text-foreground font-medium hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}