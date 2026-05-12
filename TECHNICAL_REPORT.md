# Mindcrafted Stream - Complete Technical Report
**Generated:** 2024
**Purpose:** Pre-deployment audit for Vercel production

---

## 1. PROJECT STRUCTURE

### Complete Directory Tree

```
src/
├── app/
│   ├── (auth)/                          # Auth route group
│   │   ├── forgot-password/
│   │   │   └── page.tsx                 # Password reset request
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   ├── reset-password/
│   │   │   └── page.tsx                 # Password reset form
│   │   ├── signup/
│   │   │   └── page.tsx                 # Signup page
│   │   └── layout.tsx                   # Auth layout (minimal header)
│   ├── (watchlist)/                     # Protected route group
│   │   ├── discover/
│   │   │   ├── components/
│   │   │   │   ├── helpers.tsx          # Discover page helpers
│   │   │   │   └── SectionHeader.tsx    # Section header component
│   │   │   ├── constants/
│   │   │   │   └── genres.ts            # Genre constants
│   │   │   ├── types/
│   │   │   │   └── discover.ts          # Discover types
│   │   │   ├── DiscoverClient.tsx       # Client component
│   │   │   └── page.tsx                 # Discover page
│   │   ├── profile/
│   │   │   ├── types/
│   │   │   │   └── profile.ts           # Profile types
│   │   │   ├── actions.ts               # Profile server actions
│   │   │   ├── page.tsx                 # Profile page
│   │   │   └── ProfileForm.tsx          # Profile form component
│   │   ├── watchlist/
│   │   │   ├── components/
│   │   │   │   ├── AddItemModal.tsx     # Add item modal
│   │   │   │   ├── FeaturedBanner.tsx   # Featured banner
│   │   │   │   ├── HeroSection.tsx      # Hero with tabs
│   │   │   │   ├── ItemDetailModal.tsx  # Item detail modal
│   │   │   │   ├── StarRating.tsx       # Star rating component
│   │   │   │   ├── use-watchlist.ts     # Watchlist hook
│   │   │   │   ├── WatchCard.tsx        # Watch card component
│   │   │   │   ├── WatchlistClient.tsx  # Client wrapper
│   │   │   │   ├── WatchlistFilters.tsx # Filters component
│   │   │   │   ├── WatchlistGrid.tsx    # Grid with virtualization
│   │   │   │   ├── WatchlistToolbar.tsx # Toolbar component
│   │   │   │   └── WatchlistViewTabs.tsx# View tabs component
│   │   │   ├── actions.ts               # Re-exports from lib
│   │   │   └── page.tsx                 # Watchlist page
│   │   └── layout.tsx                   # Watchlist layout (header + nav)
│   ├── api/
│   │   ├── recommendations/
│   │   │   └── route.ts                 # GET recommendations
│   │   ├── stats/
│   │   │   └── route.ts                 # GET platform stats
│   │   ├── tmdb/
│   │   │   └── route.ts                 # GET/POST TMDB proxy
│   │   └── watchlist/
│   │       └── route.ts                 # GET/POST watchlist items
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                 # OAuth callback handler
│   ├── components/
│   │   ├── Footer.tsx                   # Footer component
│   │   ├── HomeHelpers.tsx              # Homepage helpers
│   │   └── logo.tsx                     # Logo component
│   ├── privacy/
│   │   └── page.tsx                     # Privacy policy
│   ├── terms/
│   │   └── page.tsx                     # Terms of service
│   ├── globals.css                      # Global styles
│   ├── layout.tsx                       # Root layout
│   ├── not-found.tsx                    # 404 page
│   └── page.tsx                         # Homepage
├── assets/
│   ├── logo-horizontal-dark.svg         # Dark mode logo
│   ├── logo-horizontal.svg              # Light mode logo
│   └── logo-stacked.svg                 # Stacked logo
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   ├── PosterRow.tsx                    # Horizontal poster row
│   ├── RecommendationsSection.tsx       # Recommendations section
│   ├── ScrollReveal.tsx                 # Scroll animation wrapper
│   ├── theme-provider.tsx               # Theme provider
│   ├── theme-toggle.tsx                 # Theme toggle button
│   └── TrendingSection.tsx              # Trending section
├── hooks/
│   └── use-mobile.ts                    # Mobile detection hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Client-side Supabase
│   │   └── server.ts                    # Server-side Supabase
│   ├── home-data.ts                     # Homepage static data
│   ├── platform-stats.ts                # Platform stats helpers
│   ├── tmdb.ts                          # TMDB helper functions
│   ├── utils.ts                         # Utility functions (cn)
│   ├── watchlist-actions.ts             # Server actions
│   └── watchlist-utils.ts               # Watchlist utilities
└── proxy.ts                             # Middleware (auth + routing)
```

---

## 2. FILE SIZES & DESCRIPTIONS

### App Routes

| File | Lines | Description |
|------|-------|-------------|
| `app/page.tsx` | ~450 | Homepage with hero, trending, features, CTA |
| `app/layout.tsx` | ~50 | Root layout with fonts, theme provider |
| `app/not-found.tsx` | ~60 | 404 page |
| `app/(auth)/layout.tsx` | ~25 | Auth layout (minimal header) |
| `app/(auth)/login/page.tsx` | ~150 | Login page with email/password + Google OAuth |
| `app/(auth)/signup/page.tsx` | ~200 | Signup page with email/password + Google OAuth |
| `app/(auth)/forgot-password/page.tsx` | ~90 | Password reset request form |
| `app/(auth)/reset-password/page.tsx` | ~100 | Password reset form |
| `app/(watchlist)/layout.tsx` | ~50 | Watchlist layout with header + nav |
| `app/(watchlist)/watchlist/page.tsx` | ~100 | Watchlist page (server component) |
| `app/(watchlist)/watchlist/actions.ts` | ~1 | Re-exports server actions from lib |
| `app/(watchlist)/discover/page.tsx` | ~150 | Discover page (genre browsing) |
| `app/(watchlist)/profile/page.tsx` | ~80 | Profile page |
| `app/privacy/page.tsx` | ~50 | Privacy policy placeholder |
| `app/terms/page.tsx` | ~50 | Terms of service placeholder |

### Watchlist Components

| File | Lines | Description |
|------|-------|-------------|
| `WatchlistClient.tsx` | ~150 | Main client wrapper for watchlist |
| `WatchCard.tsx` | ~90 | Individual watch card component |
| `AddItemModal.tsx` | ~350 | 3-step modal: search → results → confirm |
| `ItemDetailModal.tsx` | ~350 | Detail modal with edit/delete |
| `HeroSection.tsx` | ~400 | Hero with 4 tabs: Featured/Overview/Activity/Discover |
| `WatchlistGrid.tsx` | ~150 | Grid with virtualization for large lists |
| `WatchlistViewTabs.tsx` | ~130 | View mode tabs (All/Watching/Watched/etc) |
| `WatchlistToolbar.tsx` | ~100 | Search + sort + filters toolbar |
| `WatchlistFilters.tsx` | ~120 | Genre/year/rating filters |
| `FeaturedBanner.tsx` | ~80 | Featured item banner |
| `StarRating.tsx` | ~40 | Star rating input component |
| `use-watchlist.ts` | ~300 | Main watchlist hook (state + filtering) |

### API Routes

| File | Lines | Description |
|------|-------|-------------|
| `api/watchlist/route.ts` | ~90 | GET all items, POST new item |
| `api/tmdb/route.ts` | ~250 | GET search/trending/genre, POST detail |
| `api/recommendations/route.ts` | ~150 | GET personalized recommendations |
| `api/stats/route.ts` | ~25 | GET platform stats (cached 1h) |
| `auth/callback/route.ts` | ~20 | OAuth callback handler |

### Shared Components

| File | Lines | Description |
|------|-------|-------------|
| `components/PosterRow.tsx` | ~150 | Horizontal scrolling poster row |
| `components/TrendingSection.tsx` | ~120 | Trending section with tabs |
| `components/RecommendationsSection.tsx` | ~120 | Recommendations section |
| `components/ScrollReveal.tsx` | ~100 | CSS scroll-driven animations |
| `components/theme-provider.tsx` | ~40 | next-themes provider |
| `components/theme-toggle.tsx` | ~30 | Theme toggle button |
| `components/Footer.tsx` | ~50 | Footer component |
| `components/HomeHelpers.tsx` | ~60 | Homepage helper components |
| `components/logo.tsx` | ~25 | Logo with theme switching |

### Lib Files

| File | Lines | Description |
|------|-------|-------------|
| `lib/supabase/client.ts` | ~10 | Client-side Supabase singleton |
| `lib/supabase/server.ts` | ~30 | Server-side Supabase with cookies |
| `lib/watchlist-actions.ts` | ~120 | Server actions (add/update/delete/signOut) |
| `lib/watchlist-utils.ts` | ~25 | Status mapping utilities |
| `lib/tmdb.ts` | ~50 | TMDB helper functions |
| `lib/platform-stats.ts` | ~60 | Platform stats with caching |
| `lib/home-data.ts` | ~70 | Homepage static data (posters, features, steps) |
| `lib/utils.ts` | ~10 | cn() utility for classnames |

### Middleware

| File | Lines | Description |
|------|-------|-------------|
| `proxy.ts` | ~110 | Middleware for auth + routing + security headers |

---

## 3. IMPORT MAP

### External Dependencies

**Core:**
- `next` (App Router, Image, Link, navigation)
- `react` (hooks, components)
- `@supabase/ssr` (server-side auth)
- `@supabase/supabase-js` (client-side auth)

**UI:**
- `lucide-react` (icons)
- `next-themes` (theme switching)
- `sonner` (toast notifications)
- `@radix-ui/*` (headless UI primitives via shadcn/ui)
- `tailwindcss` (styling)
- `class-variance-authority` (variant utilities)
- `clsx` + `tailwind-merge` (classname merging)

**Fonts:**
- `next/font/google` (Inter, Playfair Display)

### Internal Import Patterns

**Most imported files:**
1. `@/lib/supabase/server` - Used by all server components/actions
2. `@/lib/supabase/client` - Used by all client components
3. `@/components/ui/*` - Used throughout for UI primitives
4. `lucide-react` - Icons used in 90% of components
5. `@/lib/watchlist-actions` - Used by watchlist components

**Import chains:**
- `page.tsx` → `WatchlistClient` → `use-watchlist` → `watchlist-actions`
- `AddItemModal` → `watchlist-actions` → `supabase/server`
- `TrendingSection` → `PosterRow` → `api/watchlist`

---

## 4. DUPLICATE / REDUNDANT FILES

### ✅ No Major Duplicates Found

**Potential cleanup:**
- `app/(watchlist)/watchlist/actions.ts` - Just re-exports from `lib/watchlist-actions.ts`. Could be removed and import directly from lib.

---

## 5. NAMING INCONSISTENCIES

### ✅ Mostly Consistent

**Minor issues:**
- `use-watchlist.ts` - Hook file uses kebab-case while most other files use PascalCase
- `watchlist-actions.ts` - Uses kebab-case while most lib files use camelCase
- `watchlist-utils.ts` - Same as above

**Recommendation:** These are acceptable conventions (hooks often use kebab-case), but for consistency could rename to `useWatchlist.ts`, `watchlistActions.ts`, `watchlistUtils.ts`.

---

## 6. ENVIRONMENT VARIABLES

### Required Variables

| Variable | Type | Used In | Purpose |
|----------|------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | `lib/supabase/*`, `proxy.ts` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | `lib/supabase/*`, `proxy.ts` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | `lib/platform-stats.ts` | Service role for admin queries |
| `TMDB_API_TOKEN` | Server | `api/tmdb/route.ts`, `lib/tmdb.ts` | TMDB API bearer token |

### ⚠️ Missing Variables

None of the required variables are missing from the codebase, but you must ensure they're set in:
- `.env.local` (development)
- Vercel environment variables (production)

---

## 7. API ROUTES

### Complete API Inventory

| Route | Methods | Auth | Purpose |
|-------|---------|------|---------|
| `/api/watchlist` | GET, POST | Required | Fetch all items, add new item |
| `/api/tmdb` | GET, POST | Required | Search/trending/genre (GET), detail (POST) |
| `/api/recommendations` | GET | Required | Personalized recommendations |
| `/api/stats` | GET | None | Platform stats (cached 1h) |
| `/auth/callback` | GET | None | OAuth callback handler |

### API Details

**`/api/watchlist`**
- **GET**: Returns all watchlist items for logged-in user
- **POST**: Adds new item (prevents duplicates)
- **Body**: `{ title, type, genre, year, tmdb_id, poster, poster_small, tmdb_rating, watched, favorite }`

**`/api/tmdb`**
- **GET**: 3 modes:
  1. Genre discovery: `?genre_id=28&type=movie&limit=16`
  2. Trending: `?trending=true&type=movie`
  3. Search: `?q=inception&type=movie&page=1`
- **POST**: Fetch full detail for single title
- **Body**: `{ tmdbId, type }`

**`/api/recommendations`**
- **GET**: Returns personalized recommendations based on favorites + watched items
- **Query**: `?limit=20&type=movie` (optional)
- **Algorithm**: Scores user's items (favorite=3pts, rating 4-5=2pts, watched=1pt), fetches TMDB recommendations for top 5 seeds, deduplicates, filters out existing items

**`/api/stats`**
- **GET**: Returns `{ titlesTracked, totalUsers }`
- **Cache**: 1 hour (Next.js route segment config)

**`/auth/callback`**
- **GET**: Exchanges OAuth code for session, redirects to `?next` param or `/`

---

## 8. SERVER VS CLIENT COMPONENTS

### Server Components (No "use client")

**Pages:**
- `app/page.tsx` - Homepage
- `app/layout.tsx` - Root layout
- `app/not-found.tsx` - 404 page
- `app/(watchlist)/layout.tsx` - Watchlist layout
- `app/(watchlist)/watchlist/page.tsx` - Watchlist page
- `app/(watchlist)/discover/page.tsx` - Discover page
- `app/(watchlist)/profile/page.tsx` - Profile page
- `app/privacy/page.tsx` - Privacy page
- `app/terms/page.tsx` - Terms page

**Components:**
- `app/components/HomeHelpers.tsx` - TrendingLoader, StatRow (server components)
- `app/components/Footer.tsx` - Footer

### Client Components ("use client")

**Auth Pages:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`

**Watchlist Components:**
- `WatchlistClient.tsx`
- `WatchCard.tsx`
- `AddItemModal.tsx`
- `ItemDetailModal.tsx`
- `WatchlistGrid.tsx`
- `WatchlistViewTabs.tsx`
- `WatchlistToolbar.tsx`
- `WatchlistFilters.tsx`
- `FeaturedBanner.tsx`
- `StarRating.tsx`
- `HeroSection.tsx`

**Shared Components:**
- `components/PosterRow.tsx`
- `components/TrendingSection.tsx`
- `components/RecommendationsSection.tsx`
- `components/ScrollReveal.tsx`
- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `components/logo.tsx`

**Discover Components:**
- `app/(watchlist)/discover/DiscoverClient.tsx`
- `app/(watchlist)/discover/components/*`

**Profile Components:**
- `app/(watchlist)/profile/ProfileForm.tsx`

### Server Actions ("use server")

- `lib/watchlist-actions.ts` - All functions (addToWatchlist, updateWatchlistItem, removeFromWatchlist, signOut)
- `app/(watchlist)/profile/actions.ts` - Profile update actions

---

## 9. KNOWN ISSUES

### TypeScript Errors

✅ **None found** - Code appears to be properly typed

### Unused Imports

**Found:**
1. `app/page.tsx` - `Film` icon imported but never used (was removed in cleanup)

### `any` Types

**Found (acceptable):**
1. `api/tmdb/route.ts` - TMDB API responses use `any` (external API, no types available)
2. `api/recommendations/route.ts` - Same as above
3. Error handlers use `any` for caught errors (standard pattern)

### Potential Issues

1. **Missing metadata export** - `app/page.tsx` has no `export const metadata` for SEO
2. **Hardcoded demo data** - Homepage has "Oppenheimer · 5★" badge (intentional marketing copy)
3. **Loading="lazy" on above-fold images** - Collage posters use lazy loading but are visible on desktop
4. **No width/height on collage images** - Could cause CLS (Cumulative Layout Shift)
5. **Sequential existingIds fetch** - Could be parallelized with other queries in `app/page.tsx`

---

## 10. MISSING FOR PRODUCTION

### Critical

1. **Environment Variables**
   - ✅ All required variables are defined in code
   - ⚠️ Must be set in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `TMDB_API_TOKEN`

2. **Database Migrations**
   - ⚠️ `supabase/migrations/` folder exists but migrations not reviewed
   - Ensure all tables exist: `watchlist_items`, `profiles`

3. **SEO Metadata**
   - ⚠️ Homepage missing `metadata` export
   - ⚠️ Other pages may need unique titles/descriptions

### Important

4. **Error Boundaries**
   - ⚠️ No global error boundary (`app/error.tsx`)
   - ⚠️ No loading states for pages (`app/loading.tsx`)

5. **Analytics**
   - ⚠️ No analytics integration (Google Analytics, Plausible, etc.)

6. **Monitoring**
   - ⚠️ No error tracking (Sentry, LogRocket, etc.)

7. **Rate Limiting**
   - ⚠️ API routes have no rate limiting (could be abused)
   - TMDB API has rate limits but no client-side throttling

8. **Legal Pages**
   - ⚠️ Privacy policy is placeholder
   - ⚠️ Terms of service is placeholder

### Nice to Have

9. **Sitemap**
   - ⚠️ No `sitemap.xml` or `robots.txt`

10. **PWA Support**
    - ⚠️ No `manifest.json` or service worker

11. **Image Optimization**
    - ⚠️ Collage images use `<img>` instead of Next.js `<Image>`

12. **Performance Monitoring**
    - ⚠️ No Web Vitals tracking

---

## 11. PRODUCTION CHECKLIST

### Before Deployment

- [ ] Set all environment variables in Vercel
- [ ] Run database migrations in production Supabase
- [ ] Add `metadata` export to `app/page.tsx`
- [ ] Replace placeholder legal pages (privacy, terms)
- [ ] Add global error boundary (`app/error.tsx`)
- [ ] Add loading states (`app/loading.tsx`)
- [ ] Test OAuth callback with production URLs
- [ ] Configure Supabase redirect URLs for production domain
- [ ] Add `sitemap.xml` and `robots.txt`
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Test TMDB API rate limits
- [ ] Review and optimize images (use Next.js Image)
- [ ] Run Lighthouse audit
- [ ] Test on mobile devices
- [ ] Test dark mode
- [ ] Test all auth flows (signup, login, forgot password, OAuth)
- [ ] Test watchlist CRUD operations
- [ ] Test search and filters
- [ ] Test recommendations
- [ ] Test discover page

### Post-Deployment

- [ ] Monitor error rates
- [ ] Monitor API response times
- [ ] Monitor database query performance
- [ ] Set up uptime monitoring
- [ ] Set up backup strategy
- [ ] Document deployment process
- [ ] Create runbook for common issues

---

## 12. ARCHITECTURE NOTES

### Strengths

1. **Clean separation** - Server/client components properly separated
2. **Type safety** - Good TypeScript coverage
3. **Optimistic updates** - Watchlist uses optimistic UI patterns
4. **Caching** - API routes use Next.js caching (revalidate)
5. **Security** - Middleware handles auth properly, uses getUser() not getSession()
6. **Performance** - Virtualization for large lists, parallel queries where possible

### Potential Improvements

1. **Middleware optimization** - API routes skip getUser() call (good), but could be documented better
2. **Error handling** - Could use more granular error messages
3. **Loading states** - Some components could show better loading UIs
4. **Accessibility** - Could add more ARIA labels and keyboard navigation
5. **Testing** - No tests found (unit, integration, e2e)

---

## 13. DEPENDENCY AUDIT

### Production Dependencies

All dependencies appear to be legitimate and up-to-date. No security vulnerabilities detected in the codebase review.

**Recommendation:** Run `npm audit` before deployment to check for known vulnerabilities.

---

## 14. FINAL RECOMMENDATIONS

### High Priority

1. Add environment variables to Vercel
2. Add metadata exports for SEO
3. Replace placeholder legal pages
4. Add error boundary
5. Test OAuth with production URLs

### Medium Priority

6. Add analytics
7. Add error tracking
8. Optimize images (use Next.js Image)
9. Add rate limiting to API routes
10. Add sitemap.xml

### Low Priority

11. Add tests
12. Add PWA support
13. Improve accessibility
14. Add performance monitoring

---

**Report Complete** ✅

This codebase is **production-ready** with the high-priority items addressed. The architecture is solid, the code is clean, and the separation of concerns is well-maintained.
