import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Route classification ───────────────────────────────────────────────────

/** Fully public — zero Supabase, zero auth check */
const PUBLIC_PATHS = new Set(['/', '/privacy', '/terms', '/about'])

/** Auth pages — redirect logged-in users away */
const AUTH_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth']

/** Protected — redirect logged-out users to login */
const PROTECTED_PREFIXES = ['/watchlist', '/profile', '/discover']

/**
 * API routes — need session cookie refreshed but NO redirect.
 * The route handler itself returns 401 JSON for unauthed requests.
 * Running getUser() here on every API call was adding ~500ms per request.
 */
const API_PREFIX = '/api/'

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))
}

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

function buildSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, get response() { return response } }
}

// Only allow safe internal relative paths for the `next` redirect param
const SAFE_REDIRECT_PATH = /^\/[a-zA-Z0-9\-\/]*$/

function sanitizeNextParam(raw: string | null): string {
  if (!raw) return '/watchlist'
  return SAFE_REDIRECT_PATH.test(raw) ? raw : '/watchlist'
}

// ── Middleware ─────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Fully public pages — no Supabase at all ─────────────────────────
  if (PUBLIC_PATHS.has(pathname)) {
    return addSecurityHeaders(NextResponse.next({ request }))
  }

  // ── 2. API routes — only refresh the session cookie, no redirect logic ──
  // Previously getUser() was called here adding ~500ms per API request.
  // API route handlers do their own auth check and return 401 JSON.
  if (pathname.startsWith(API_PREFIX)) {
    const { supabase, response } = buildSupabaseClient(request)
    // getSession() is enough here — just needs to refresh the cookie.
    // We don't use the session value, just let the cookie refresh happen.
    await supabase.auth.getSession()
    return addSecurityHeaders(response)
  }

  // ── 3. All other routes — need real auth check ─────────────────────────
  const { supabase, response } = buildSupabaseClient(request)

  // getUser() validates the JWT server-side — cannot be spoofed.
  // Only called for non-API, non-public routes.
  const { data: { user } } = await supabase.auth.getUser()

  // ── 4. Protected routes: require login ─────────────────────────────────
  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Auth routes: bounce logged-in users ─────────────────────────────
  if (user && matchesPrefix(pathname, AUTH_PREFIXES)) {
    const rawNext = request.nextUrl.searchParams.get('next')
    const safeNext = sanitizeNextParam(rawNext)
    const redirectUrl = new URL(safeNext, new URL(request.url).origin)
    return NextResponse.redirect(redirectUrl)
  }

  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}