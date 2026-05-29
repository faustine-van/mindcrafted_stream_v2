"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye, CheckCircle2, Bookmark, Heart,
  Film, Tv, Star, TrendingUp, BarChart2,
  Clapperboard, Compass, ArrowRight, Plus,
  Check, Loader2, Sparkles,
} from "lucide-react";
import type { WatchItem } from "@/app/(watchlist)/watchlist/components/WatchCard";
import { FeaturedBanner } from "./FeaturedBanner";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface LiveStats {
  total: number;
  watching: number;
  watched: number;
  unwatched: number;
  favorites: number;
  movies: number;
  series: number;
  averageRating: string | number;
}

interface Props {
  featured: WatchItem | null;
  stats: LiveStats;
  items: WatchItem[];
  initialTrending?: DiscoverItem[];
  existingIds?: string[];
}

type HeroTab = "featured" | "stats" | "activity" | "discover";

/* ─────────────────────────────────────────
   DiscoverItem type (used by DiscoverPanel
   and referenced in Props above)
───────────────────────────────────────── */
interface DiscoverItem {
  tmdbId: string;
  title: string;
  type: string;
  year: string;
  poster: string;
  posterSmall: string;
  tmdbRating: number;
  genre?: string;
}

/* ─────────────────────────────────────────
   Shared sub-components (stats + activity)
───────────────────────────────────────── */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function GenreBar({ genre, count, total }: { genre: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6","#f97316","#84cc16"];
  const colorIndex = genre.charCodeAt(0) % colors.length;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 truncate shrink-0">{genre}</span>
      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[colorIndex] }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

function CompletionRing({ watched, total }: { watched: number; total: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? watched / total : 0;
  const dash = pct * circ;
  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-watched, #22c55e)" strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-bold tabular-nums leading-none">{Math.round(pct * 100)}%</p>
        <p className="text-[9px] text-muted-foreground mt-0.5">done</p>
      </div>
    </div>
  );
}

function StatsOverview({ stats }: { stats: LiveStats }) {
  const statCards = [
    { label: "Watching",      value: stats.watching,  icon: Eye,         color: "var(--color-watching, #3b82f6)", max: stats.total, description: "In progress" },
    { label: "Watched",       value: stats.watched,   icon: CheckCircle2,color: "var(--color-watched, #22c55e)",  max: stats.total, description: "Completed"   },
    { label: "Want to Watch", value: stats.unwatched, icon: Bookmark,    color: "var(--color-want, #f59e0b)",     max: stats.total, description: "On your list"},
    { label: "Favorites",     value: stats.favorites, icon: Heart,       color: "#EC4899",                        max: stats.total, description: "Loved it"    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3 group hover:border-border/80 transition-colors">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `color-mix(in oklab, ${s.color} 15%, transparent)`, color: s.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
              </div>
              <MiniBar value={s.value} max={s.max} color={s.color} />
              <div>
                <p className="text-xs font-medium leading-none">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 col-span-2 sm:col-span-1">
          <CompletionRing watched={stats.watched} total={stats.total} />
          <div>
            <p className="text-sm font-semibold">Completion</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stats.watched} of {stats.total} titles</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl grid place-items-center bg-violet-500/10 text-violet-500 shrink-0"><Film className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold tabular-nums">{stats.movies}</p><p className="text-[11px] text-muted-foreground">Movies</p></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl grid place-items-center bg-sky-500/10 text-sky-500 shrink-0"><Tv className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold tabular-nums">{stats.series}</p><p className="text-[11px] text-muted-foreground">TV Shows</p></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl grid place-items-center bg-amber-500/10 text-amber-500 shrink-0"><Star className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold tabular-nums">{stats.averageRating}</p><p className="text-[11px] text-muted-foreground">Avg Rating</p></div>
        </div>
      </div>
    </div>
  );
}

function ActivityPanel({ items, stats }: { items: WatchItem[]; stats: LiveStats }) {
  const genreCounts = new Map<string, number>();
  for (const item of items) {
    if (!item.genre) continue;
    item.genre.split(",").forEach((g) => {
      const genre = g.trim();
      if (genre) genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    });
  }
  const topGenres = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxGenreCount = topGenres[0]?.[1] ?? 1;
  const topRated = [...items].filter((i) => i.rating > 0).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);
  const recent = items.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><BarChart2 className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Top Genres</h3></div>
        {topGenres.length === 0 ? <p className="text-xs text-muted-foreground">No genre data yet.</p> : (
          <div className="space-y-2.5">{topGenres.map(([genre, count]) => <GenreBar key={genre} genre={genre} count={count} total={maxGenreCount} />)}</div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Your Top Rated</h3></div>
        {topRated.length === 0 ? <p className="text-xs text-muted-foreground">Rate some titles to see them here.</p> : (
          <div className="space-y-2.5">
            {topRated.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                {item.poster ? <img src={item.poster} alt={item.title} className="w-7 h-10 rounded object-cover shrink-0 border border-border" /> : <div className="w-7 h-10 rounded bg-muted shrink-0 flex items-center justify-center"><Film className="h-3 w-3 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{item.title}</p><p className="text-[10px] text-muted-foreground">{item.year}</p></div>
                <div className="flex items-center gap-0.5 shrink-0">{Array.from({ length: item.rating }).map((_, si) => <Star key={si} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Recently Added</h3></div>
        {recent.length === 0 ? <p className="text-xs text-muted-foreground">Nothing added yet.</p> : (
          <div className="space-y-2.5">
            {recent.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                {item.poster ? <img src={item.poster} alt={item.title} className="w-7 h-10 rounded object-cover shrink-0 border border-border" /> : <div className="w-7 h-10 rounded bg-muted shrink-0 flex items-center justify-center"><Clapperboard className="h-3 w-3 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{item.year}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${item.status === "Watching" ? "bg-blue-500/10 text-blue-500" : item.status === "Watched" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Discover panel — 4th tab
   Trending is passed as a prop (server-fetched
   in the watchlist page). Recommendations are
   still fetched client-side (personalised).
───────────────────────────────────────── */

function DiscoverPosterCard({
  item,
  isAdded,
  isLoading,
  onAdd,
}: {
  item: DiscoverItem;
  isAdded: boolean;
  isLoading: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="shrink-0 w-[100px] sm:w-[115px] group/card">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
        {item.poster && (
          <img
            src={item.posterSmall || item.poster}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
            loading="lazy"
          />
        )}
        {/* TMDB rating */}
        {item.tmdbRating > 0 && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-white font-medium">{item.tmdbRating.toFixed(1)}</span>
          </div>
        )}
        {/* Add button */}
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isLoading}
          aria-label={isAdded ? "Already in watchlist" : "Add to watchlist"}
          className={`
            absolute bottom-1.5 right-1.5 h-7 w-7 rounded-lg flex items-center justify-center
            shadow-md transition-all duration-200 disabled:cursor-default
            ${isAdded
              ? "bg-green-500 text-white opacity-100"
              : "bg-white/90 text-gray-800 hover:bg-white opacity-0 group-hover/card:opacity-100"
            }
          `}
        >
          {isLoading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-600" />
            : isAdded
            ? <Check className="h-3.5 w-3.5" />
            : <Plus className="h-3.5 w-3.5" />
          }
        </button>
      </div>
      <p className="mt-1.5 text-[11px] font-medium truncate px-0.5">{item.title}</p>
      <p className="text-[10px] text-muted-foreground px-0.5">{item.year}</p>
    </div>
  );
}

function DiscoverRow({
  label,
  icon: Icon,
  iconBg,
  items,
  addedIds,
  loadingId,
  onAdd,
  isLoading,
}: {
  label: string;
  icon: React.ElementType;
  iconBg: string;
  items: DiscoverItem[];
  addedIds: Set<string>;
  loadingId: string | null;
  onAdd: (item: DiscoverItem) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${iconBg}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <Link
          href="/discover"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-2.5">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="shrink-0 w-[100px] sm:w-[115px]">
              <div className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
              <div className="mt-1.5 h-2.5 bg-muted rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">Nothing to show yet.</p>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {items.map((item) => (
            <DiscoverPosterCard
              key={item.tmdbId}
              item={item}
              isAdded={addedIds.has(item.tmdbId)}
              isLoading={loadingId === item.tmdbId}
              onAdd={() => onAdd(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoverPanel({
  existingIds = [],
  initialTrending = [],
}: {
  existingIds: string[];
  initialTrending: DiscoverItem[];
}) {
  // Trending is pre-fetched server-side — no client fetch needed.
  const [trending] = useState<DiscoverItem[]>(initialTrending);
  const [recs, setRecs] = useState<DiscoverItem[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(existingIds));
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [recsFetched, setRecsFetched] = useState(false);

  // Only fetch recs once when this panel first mounts (tab is opened).
  useEffect(() => {
    if (recsFetched) return;
    setRecsFetched(true);
    fetch("/api/recommendations?limit=12", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRecs(d.results ?? []))
      .catch(() => setRecs([]))
      .finally(() => setRecsLoading(false));
  }, [recsFetched]);

  async function handleAdd(item: DiscoverItem) {
    if (addedIds.has(item.tmdbId) || loadingId) return;
    setLoadingId(item.tmdbId);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title:        item.title,
          type:         item.type,
          genre:        item.genre ?? "",
          year:         item.year,
          tmdb_id:      item.tmdbId,
          poster:       item.poster,
          poster_small: item.posterSmall,
          tmdb_rating:  item.tmdbRating,
          watched:      false,
          favorite:     false,
        }),
      });
      if (res.ok) {
        setAddedIds((prev) => new Set([...prev, item.tmdbId]));
      }
    } catch {
      // ignore — button stays interactive
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Trending row — no loading state, data arrives as prop */}
      <DiscoverRow
        label="Trending this week"
        icon={TrendingUp}
        iconBg="bg-violet-500/10 text-violet-500"
        items={trending}
        addedIds={addedIds}
        loadingId={loadingId}
        onAdd={handleAdd}
        isLoading={false}
      />

      {/* Recommendations row — fetched client-side on first tab open */}
      <DiscoverRow
        label="Picked for you"
        icon={Sparkles}
        iconBg="bg-pink-500/10 text-pink-500"
        items={recs}
        addedIds={addedIds}
        loadingId={loadingId}
        onAdd={handleAdd}
        isLoading={recsLoading}
      />

      {/* CTA to full discover page */}
      <div className="flex items-center justify-center pt-1">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 h-9 px-5 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Compass className="h-4 w-4" />
          Open full Discover page
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HeroSection — main export
───────────────────────────────────────── */
const HERO_TABS: { id: HeroTab; label: string; icon: React.ElementType }[] = [
  { id: "featured", label: "Featured", icon: Clapperboard },
  { id: "stats",    label: "Overview", icon: BarChart2    },
  { id: "activity", label: "Activity", icon: TrendingUp   },
  { id: "discover", label: "Discover", icon: Compass      },
];

export function HeroSection({ featured, stats, items, existingIds = [], initialTrending = [] }: Props) {
  const [activeTab, setActiveTab] = useState<HeroTab>(
    featured ? "featured" : "stats"
  );

  return (
    <div className="space-y-4">
      {/* Tab row */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3">
        {HERO_TABS.map(({ id, label, icon: Icon }) => {
          if (id === "featured" && !featured) return null;
          const isActive = activeTab === id;
          // Discover tab gets a subtle violet tint when active to visually
          // distinguish it from the watchlist-scoped tabs.
          const activeClass = id === "discover" && isActive
            ? "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
            : isActive
            ? "bg-accent border-accent text-accent-foreground"
            : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground";

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-label={label}
              className={`flex items-center gap-1.5 h-8 rounded-lg text-xs font-medium border transition-all duration-150 ${
                isActive ? "px-3" : "px-2.5"
              } ${activeClass}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {isActive && <span>{label}</span>}
            </button>
          );
        })}

        {/* Total pill */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Film className="h-3.5 w-3.5" />
          <span className="tabular-nums font-medium">{stats.total}</span>
          <span>titles</span>
        </div>
      </div>

      {/* Panel */}
      <div className="min-h-[200px]">
        {activeTab === "featured" && featured && <FeaturedBanner item={featured} />}
        {activeTab === "stats"    && <StatsOverview stats={stats} />}
        {activeTab === "activity" && <ActivityPanel items={items} stats={stats} />}
        {activeTab === "discover" && <DiscoverPanel existingIds={existingIds} initialTrending={initialTrending} />}
      </div>
    </div>
  );
}