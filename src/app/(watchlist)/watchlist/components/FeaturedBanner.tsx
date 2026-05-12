"use client";

import { Play, Info } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";
import type { WatchItem } from "./WatchCard";

interface Props {
  item: WatchItem;
}

export function FeaturedBanner({ item }: Props) {
  // Prefer backdrop (wide) over poster for the banner
  const bgImage = item.backdrop || item.poster

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border min-h-[260px] md:min-h-[320px]">
      {/* Background image */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {/* Gradient overlays — left-to-background, bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end h-full min-h-[260px] md:min-h-[320px] max-w-2xl">
        {/* Status pill */}
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: item.status === "Watching"
                ? "color-mix(in oklab, var(--color-watching) 20%, transparent)"
                : "color-mix(in oklab, var(--color-want) 20%, transparent)",
              color: item.status === "Watching"
                ? "var(--color-watching)"
                : "var(--color-want)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: item.status === "Watching"
                  ? "var(--color-watching)"
                  : "var(--color-want)",
              }}
            />
            {item.status === "Watching" ? "Continue watching" : "Up next"}
          </span>
        </div>

        {/* Title — clean, no background box */}
        <h2 className="text-2xl md:text-4xl font-serif font-semibold tracking-tight text-foreground drop-shadow-sm">
          {item.title}
        </h2>

        {/* Meta line */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          {item.year && <span>{item.year}</span>}
          {item.year && item.genre && <span>·</span>}
          {item.genre && (
            <span className="truncate max-w-[200px]">
              {item.genre.split(",").slice(0, 2).join(", ")}
            </span>
          )}
          {item.runtime ? (
            <>
              <span>·</span>
              <span>{Math.floor(item.runtime / 60)}h {item.runtime % 60}m</span>
            </>
          ) : null}
        </div>

        {/* Plot snippet */}
        {item.plot && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 max-w-lg leading-relaxed">
            {item.plot}
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition shadow-lg shadow-accent/20">
            <Play className="h-4 w-4 fill-current" />
            {item.status === "Watching" ? "Resume" : "Watch"}
          </button>
          <ItemDetailModal item={item}>
            <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-white/20 bg-background/40 backdrop-blur-sm text-sm font-medium hover:bg-background/60 transition">
              <Info className="h-4 w-4" />
              Details
            </button>
          </ItemDetailModal>
        </div>
      </div>
    </section>
  )
}