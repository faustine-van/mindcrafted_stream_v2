import Link from "next/link";
import { Suspense } from "react";
import {
  Play,
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Heart,
  Plus,
} from "lucide-react";
import { Logo } from "@/app/components/logo";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { collagePosterRows, features, howItWorksSteps } from "@/lib/home-data";
import {
  getPlatformStats,
  formatStat,
  formatRating,
} from "@/lib/platform-stats";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  TrendingSkeleton,
  TrendingLoader,
  StatRow,
} from "@/app/components/HomeHelpers";
import { Footer } from "@/app/components/Footer";

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const [platformStats, existingIdsResult] = await Promise.all([
    getPlatformStats(),
    user
      ? supabase
          .from("watchlist_items")
          .select("tmdb_id")
          .eq("user_id", user.id)
          .not("tmdb_id", "is", null)
      : Promise.resolve({ data: [] as { tmdb_id: string }[] }),
  ]);

  const existingIds = (existingIdsResult.data ?? [])
    .map((r) => r.tmdb_id)
    .filter(Boolean) as string[];

  const heroStats = [
    { value: formatStat(platformStats.titlesTracked), label: "Titles tracked" },
    { value: formatStat(platformStats.totalUsers), label: "Members" },
    { value: formatRating(platformStats.avgRating), label: "Avg rating" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/watchlist"
                className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition ml-1"
              >
                <span className="hidden sm:inline">My Watchlist</span>
                <span className="sm:hidden">Watchlist</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-1 ml-1">
                <Link
                  href="/login"
                  className="inline-flex items-center h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  <span className="hidden sm:inline">Get started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(65% 55% at 65% 5%, color-mix(in oklab, #8B5CF6 16%, transparent), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
          <div>
            {isLoggedIn ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Welcome back
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
                  Your library,{" "}
                  <span className="italic" style={{ color: "#8B5CF6" }}>
                    right where you left it.
                  </span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
                  Jump back in — your watchlist is waiting. Browse what&apos;s
                  trending or pick up where you left off.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <Link
                    href="/watchlist"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Go to my Watchlist <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <StatRow stats={heroStats} />
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  Your personal stream — curated.
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
                  Every film &amp; show,{" "}
                  <span className="italic" style={{ color: "#8B5CF6" }}>
                    one quiet place.
                  </span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
                  Mindcrafted Stream is a calm, focused watchlist for the things
                  you love watching — and the ones still waiting their turn.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-12">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary transition"
                  >
                    <Play className="h-4 w-4" /> Sign in
                  </Link>
                </div>
                <StatRow stats={heroStats} />
              </>
            )}
          </div>

          {/* Poster collage */}
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="absolute -top-3 right-6 z-10 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg grid place-items-center"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                }}
              >
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold">Trending now</p>
                <p className="text-[10px] text-muted-foreground">
                  Updated weekly
                </p>
              </div>
            </div>
            <div className="absolute bottom-20 -left-3 z-10 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs font-semibold">Oppenheimer · 5★</p>
              <p className="text-[10px] text-muted-foreground">Just rated</p>
            </div>
            <div className="absolute top-1/2 -right-3 z-10 bg-card border border-border rounded-2xl px-3 py-2.5 shadow-xl flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              <p className="text-xs font-semibold">Added to favorites</p>
            </div>
            <div
              className="flex gap-3 h-[540px] overflow-hidden rounded-2xl"
              style={{
                maskImage:
                  "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
            >
              <div className="flex-1 flex flex-col gap-3 animate-[scrollUp_25s_linear_infinite]">
                {[...collagePosterRows[0], ...collagePosterRows[0]].map(
                  (src, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-md"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3 mt-[-72px] animate-[scrollDown_30s_linear_infinite]">
                {[...collagePosterRows[1], ...collagePosterRows[1]].map(
                  (src, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-md"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending ── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                }}
              >
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Trending this week
                </h2>
                <p className="text-sm text-muted-foreground">
                  What everyone is watching right now
                </p>
              </div>
            </div>
            {isLoggedIn && (
              <Link
                href="/watchlist"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View watchlist <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {/* Suspense wraps the async server component directly — no client wrapper */}
          <Suspense fallback={<TrendingSkeleton />}>
            <TrendingLoader isLoggedIn={isLoggedIn} existingIds={existingIds} />
          </Suspense>
        </div>
      </section>

      {/* ── Recommendations (logged-in only) ── */}
      {isLoggedIn && (
        <section className="border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 md:py-20">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #EC4899, #BE185D)",
                }}
              >
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Picked for you
                </h2>
                <p className="text-sm text-muted-foreground">
                  Based on your favorites and watched titles
                </p>
              </div>
            </div>
            <RecommendationsSection existingIds={existingIds} />
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16 items-start">
            <ScrollReveal variant="slide-left" className="lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Why it works
              </p>
              <h2 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
                Built around your habits, not an algorithm.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No social pressure. No noise. Just the films and series that
                matter to you, in one clean place.
              </p>
            </ScrollReveal>
            <div className="flex flex-col gap-1">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <ScrollReveal
                    key={f.title}
                    variant="slide-right"
                    delay={i * 80}
                  >
                    <div className="flex gap-4 items-start p-4 rounded-xl border border-transparent hover:border-border hover:bg-card/60 transition-all group cursor-default">
                      <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 grid place-items-center shrink-0 group-hover:bg-violet-500/15 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-semibold mb-1">
                          {f.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works — now uses howItWorksSteps from home-data ── */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 items-start">
            <ScrollReveal variant="slide-left" className="lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Getting started
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
                Three steps.
                <br className="hidden sm:block" /> That&apos;s it.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;ll have your first title added in under a minute.
              </p>
            </ScrollReveal>
            <div className="flex flex-col">
              {howItWorksSteps.map((s, idx) => {
                const Icon = s.icon;
                const isLast = idx === howItWorksSteps.length - 1;
                return (
                  <ScrollReveal key={s.num} variant="fade-up" delay={idx * 120}>
                    <div
                      className={`grid grid-cols-[52px_1fr] gap-5 py-6 ${!isLast ? "border-b border-border" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <span className="font-sans text-3xl font-semibold text-muted-foreground/40 leading-none">
                          {s.num}
                        </span>
                        {!isLast && (
                          <div className="w-px flex-1 min-h-[24px] bg-border" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 pb-1">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 grid place-items-center shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-sans text-base font-semibold">
                            {s.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {s.desc}
                        </p>
                        {s.tag && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-500/8 rounded-full px-3 py-1 w-fit">
                            {s.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA (logged-out only) ── */}
      {!isLoggedIn && (
        <section className="border-t border-border relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              background:
                "radial-gradient(50% 100% at 50% 100%, color-mix(in oklab, #8B5CF6 25%, transparent), transparent)",
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
            <ScrollReveal variant="scale-up">
              <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                Your next favorite watch
                <span className="block italic text-muted-foreground">
                  deserves a home.
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Start your library today — free, ad-free, and entirely yours.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
              >
                Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}
