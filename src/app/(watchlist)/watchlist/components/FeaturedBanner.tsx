"use client";

import { Info } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";
import type { WatchItem } from "./WatchCard";

interface Props {
  item: WatchItem;
}

export function FeaturedBanner({ item }: Props) {
  const bgImage = item.backdrop || item.poster;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border h-[220px] sm:h-[280px] md:h-[320px]">
      {/* Background image */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 md:p-10">
        {/* Status pill */}
        <div className="mb-2 sm:mb-3">
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
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: item.status === "Watching"
                  ? "var(--color-watching)"
                  : "var(--color-want)",
              }}
            />
            {item.status === "Watching" ? "Continue watching" : "Up next"}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-semibold tracking-tight text-foreground drop-shadow-sm line-clamp-2">
          {item.title}
        </h2>

        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
          {item.year && <span>{item.year}</span>}
          {item.year && item.genre && <span>·</span>}
          {item.genre && (
            <span className="truncate max-w-[160px] sm:max-w-[240px]">
              {item.genre.split(",").slice(0, 2).join(", ")}
            </span>
          )}
          {!!item.runtime && (
            <>
              <span>·</span>
              <span>{Math.floor(item.runtime / 60)}h {item.runtime % 60}m</span>
            </>
          )}
        </div>

        {/* Plot — hidden on smallest screens to avoid clutter */}
        {item.plot && (
          <p className="hidden sm:block mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-xs sm:max-w-sm md:max-w-lg leading-relaxed">
            {item.plot}
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 sm:mt-5">
          <ItemDetailModal item={item}>
            <button className="inline-flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-5 rounded-xl border border-white/20 bg-background/40 backdrop-blur-sm text-xs sm:text-sm font-medium hover:bg-background/60 transition">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Details
            </button>
          </ItemDetailModal>
        </div>
      </div>
    </section>
  );
}
