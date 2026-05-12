"use client";

import { useState } from "react";
import {
  Calendar, Clock, Star, Heart, Tv, Film,
  ExternalLink, Trash2, Check, Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateWatchlistItem, removeFromWatchlist } from "@/lib/watchlist-actions";
import type { WatchItem, WatchStatus } from "./WatchCard";
import { StarRating } from "@/app/(watchlist)/watchlist/components/StarRating";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const STATUS_OPTIONS: WatchStatus[] = ["Want to Watch", "Watching", "Watched"];

const STATUS_CONFIG: Record<WatchStatus, { color: string; dot: string }> = {
  Watching: {
    color: "text-[color:var(--color-watching)]",
    dot:   "bg-[color:var(--color-watching)]",
  },
  Watched: {
    color: "text-[color:var(--color-watched)]",
    dot:   "bg-[color:var(--color-watched)]",
  },
  "Want to Watch": {
    color: "text-[color:var(--color-want)]",
    dot:   "bg-[color:var(--color-want)]",
  },
};

function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
interface Props {
  item: WatchItem;
  children: React.ReactNode;
  onUpdate?: (id: string, changes: Partial<WatchItem>) => void;
  onDelete?: (id: string) => void;
}

export function ItemDetailModal({ item, children, onUpdate, onDelete }: Props) {
  const [open,       setOpen]       = useState(false);
  const [status,     setStatus]     = useState<WatchStatus>(item.status);
  const [rating,     setRating]     = useState(item.rating ?? 0);
  const [favorite,   setFavorite]   = useState(item.favorite ?? false);
  // FIX: initialize from item.notes so existing notes show on open
  const [notes,      setNotes]      = useState(item.notes ?? "");
  const [isSaving,   setIsSaving]   = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-sync all local state each time the modal opens
  function handleOpenChange(val: boolean) {
    if (val) {
      setStatus(item.status);
      setRating(item.rating ?? 0);
      setFavorite(item.favorite ?? false);
      // FIX: reset to saved notes, not empty string
      setNotes(item.notes ?? "");
    }
    setOpen(val);
  }

  /* ── Favorite toggle — persists immediately ── */
  async function handleFavoriteToggle() {
    const next = !favorite;
    setFavorite(next);
    try {
      const result = await updateWatchlistItem(item.id, { favorite: next });
      if (result?.error) throw new Error(result.error);
      onUpdate?.(item.id, { favorite: next });
      toast.success(next ? "Added to favorites ♥" : "Removed from favorites");
    } catch (err: any) {
      setFavorite(!next);
      toast.error(err.message || "Could not update favorite.");
    }
  }

  /* ── Save status + rating + notes ── */
  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await updateWatchlistItem(item.id, {
        status,
        rating,
        favorite,
        notes,  // FIX: notes now included in every save
      });
      if (result?.error) throw new Error(result.error);
      onUpdate?.(item.id, { status, rating, favorite, notes });
      toast.success(`${item.title} updated.`);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!confirm(`Remove "${item.title}" from your watchlist?`)) return;
    setIsDeleting(true);
    try {
      await removeFromWatchlist(item.id);
      onDelete?.(item.id);
      toast.success(`${item.title} removed.`);
      setOpen(false);
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setIsDeleting(false);
    }
  }

  const cfg = STATUS_CONFIG[status];

  // Save button is active when status, rating, or notes changed
  const hasChanges =
    status  !== item.status       ||
    rating  !== (item.rating ?? 0)||
    notes   !== (item.notes ?? "");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-border bg-card gap-0"
        aria-describedby={undefined}
      >
        <div className="grid sm:grid-cols-[200px_1fr] min-h-0">

          {/* ── Left: Poster ── */}
          <div className="relative bg-muted sm:min-h-[500px]">
            {item.backdrop && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110"
                style={{ backgroundImage: `url(${item.backdrop})` }}
              />
            )}
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.title}
                className="relative z-10 h-full w-full object-cover sm:absolute sm:inset-0"
              />
            ) : (
              <div className="relative z-10 h-full min-h-[220px] w-full flex items-center justify-center text-muted-foreground">
                {item.type === "tv"
                  ? <Tv className="h-14 w-14 opacity-30" />
                  : <Film className="h-14 w-14 opacity-30" />}
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-card/80 to-transparent z-20 pointer-events-none" />
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className={`
                absolute bottom-3 right-3 z-30
                h-9 w-9 rounded-full flex items-center justify-center
                backdrop-blur-md border transition-all duration-200
                ${favorite
                  ? "bg-red-500/20 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "bg-black/40 border-white/15 hover:bg-black/60"
                }
              `}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${
                favorite ? "fill-red-500 text-red-500 scale-110" : "text-white/80"
              }`} />
            </button>
          </div>

          {/* ── Right: Content ── */}
          <div className="flex flex-col min-h-0">

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border/60">
              <DialogTitle className="text-lg font-semibold leading-snug">
                {item.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  {item.type === "tv"
                    ? <><Tv className="h-3 w-3" /> TV Show</>
                    : <><Film className="h-3 w-3" /> Movie</>}
                </span>
                {item.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{item.year}
                  </span>
                )}
                {!!item.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{formatRuntime(item.runtime)}
                  </span>
                )}
                {!!item.tmdb_rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.tmdb_rating.toFixed(1)}
                    <span className="opacity-60">TMDB</span>
                  </span>
                )}
              </div>
              {item.genre && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {item.genre.split(",").map((g) => (
                    <span key={g} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                      {g.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as WatchStatus)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => {
                      const c = STATUS_CONFIG[s];
                      return (
                        <SelectItem key={s} value={s}>
                          <span className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.dot}`} />
                            <span className={`text-sm ${c.color}`}>{s}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Rating</label>
                <StarRating rating={rating} onChange={setRating} />
              </div>

              {/* Synopsis */}
              {item.plot && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Synopsis</label>
                  <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4">{item.plot}</p>
                </div>
              )}

              {/* Notes — FIX: uncommented, initialized from item.notes, saved on handleSave */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Personal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note about this title…"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring/40 resize-none transition-shadow"
                />
                {/* Hint shown only when there are unsaved note changes */}
                {notes !== (item.notes ?? "") && (
                  <p className="text-[10px] text-muted-foreground">
                    Unsaved — click Save changes to keep.
                  </p>
                )}
              </div>

              {/* TMDB link */}
              {item.tmdb_id && (
                <a
                  href={`https://www.themoviedb.org/${item.type}/${item.tmdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  View on TMDB
                </a>
              )}
            </div>

            {/* ── Footer actions ── */}
            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-3 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/8 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
                {isDeleting ? "Removing…" : "Remove"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className={`
                  h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                  ${hasChanges
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  }
                  disabled:opacity-50
                `}
              >
                {isSaving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Check className="h-3.5 w-3.5" />}
                {isSaving ? "Saving…" : hasChanges ? "Save changes" : "No changes"}
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}