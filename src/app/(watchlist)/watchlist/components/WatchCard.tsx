import { Star } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";

export type WatchStatus = "Watching" | "Watched" | "Want to Watch";

export interface WatchItem {
  id: string;
  title: string;
  genre: string;
  status: WatchStatus;
  rating: number;
  poster: string;
  backdrop?: string;
  type: "movie" | "tv";
  year?: string;
  plot?: string;
  tmdb_id?: string;
  runtime?: number;
  tmdb_rating?: number;
  favorite?: boolean;
  notes?: string;      // persisted personal notes
  created_at?: string; // needed for date sort in useWatchlist
}

const statusConfig: Record<WatchStatus, { color: string; dot: string }> = {
  Watching: {
    color: "bg-[color:var(--color-watching)]/15 text-[color:var(--color-watching)]",
    dot:   "bg-[color:var(--color-watching)]",
  },
  Watched: {
    color: "bg-[color:var(--color-watched)]/15 text-[color:var(--color-watched)]",
    dot:   "bg-[color:var(--color-watched)]",
  },
  "Want to Watch": {
    color: "bg-[color:var(--color-want)]/15 text-[color:var(--color-want)]",
    dot:   "bg-[color:var(--color-want)]",
  },
};

export function WatchCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: WatchItem;
  onUpdate?: (id: string, changes: Partial<WatchItem>) => void;
  onDelete?: (id: string) => void;
}) {
  const cfg = statusConfig[item.status];

  return (
    <ItemDetailModal item={item} onUpdate={onUpdate} onDelete={onDelete}>
      <article className="group rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-black/10 cursor-pointer">
        <div className="aspect-[2/3] w-full overflow-hidden bg-muted relative">
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs text-center p-2">
              No poster
            </div>
          )}
          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/65 text-white rounded-md px-1.5 py-0.5 backdrop-blur-sm">
            {item.type === "tv" ? "TV" : "Film"}
          </span>
          {item.tmdb_rating && item.tmdb_rating > 0 ? (
            <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/65 text-white rounded-md px-1.5 py-0.5 backdrop-blur-sm">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[9px] font-semibold">{item.tmdb_rating.toFixed(1)}</span>
            </span>
          ) : null}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </div>
        <div className="p-3 space-y-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium truncate leading-snug">{item.title}</h3>
            {item.year && <p className="text-[10px] text-muted-foreground mt-0.5">{item.year}</p>}
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {item.status}
          </span>
          {item.rating > 0 && (
            <div className="flex items-center gap-0.5 pt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < item.rating ? "fill-accent text-accent" : "text-muted-foreground/25"}`} />
              ))}
            </div>
          )}
        </div>
      </article>
    </ItemDetailModal>
  );
}