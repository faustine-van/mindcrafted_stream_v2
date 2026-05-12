"use client";

import { Eye, CheckCircle2, Bookmark, Heart, LayoutGrid } from "lucide-react";
import type { ViewMode } from "./use-watchlist";

interface Props {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  stats: {
    total: number;
    watching: number;
    watched: number;
    unwatched: number;
    favorites: number;
  };
}

const TABS: {
  mode: ViewMode;
  label: string;
  key: keyof Props["stats"];
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  dotColor: string;
}[] = [
  {
    mode: "all",
    label: "All",
    key: "total",
    icon: LayoutGrid,
    activeColor: "text-accent-foreground",
    activeBg: "bg-accent border-accent",
    dotColor: "",
  },
  {
    mode: "watching",
    label: "Watching",
    key: "watching",
    icon: Eye,
    activeColor: "text-[color:var(--color-watching)]",
    activeBg: "bg-[color:var(--color-watching)]/10 border-[color:var(--color-watching)]/40",
    dotColor: "var(--color-watching)",
  },
  {
    mode: "watched",
    label: "Watched",
    key: "watched",
    icon: CheckCircle2,
    activeColor: "text-[color:var(--color-watched)]",
    activeBg: "bg-[color:var(--color-watched)]/10 border-[color:var(--color-watched)]/40",
    dotColor: "var(--color-watched)",
  },
  {
    mode: "unwatched",
    label: "Want to Watch",
    key: "unwatched",
    icon: Bookmark,
    activeColor: "text-[color:var(--color-want)]",
    activeBg: "bg-[color:var(--color-want)]/10 border-[color:var(--color-want)]/40",
    dotColor: "var(--color-want)",
  },
  {
    mode: "favorites",
    label: "Favorites",
    key: "favorites",
    icon: Heart,
    activeColor: "text-pink-500",
    activeBg: "bg-pink-500/10 border-pink-500/40",
    dotColor: "#EC4899",
  },
];

export function WatchlistViewTabs({ viewMode, onViewModeChange, stats }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TABS.map(({ mode, label, key, icon: Icon, activeColor, activeBg, dotColor }) => {
        const isActive = viewMode === mode;
        const isAll = mode === "all";
        const count = stats[key];

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={`
              group flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all duration-150
              ${isActive
                ? isAll
                  ? `${activeBg} text-accent-foreground`
                  : `${activeBg} ${activeColor}`
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            {/* Icon on every tab */}
            <Icon
              className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
                isActive ? "opacity-100" : "opacity-60 group-hover:opacity-80"
              }`}
            />

            {label}

            {/* Count badge — always uses dotColor, dimmed when inactive */}
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold tabular-nums transition-all"
              style={
                isAll
                  ? isActive
                    ? { backgroundColor: "color-mix(in oklab, currentColor 15%, transparent)" }
                    : { backgroundColor: "color-mix(in oklab, currentColor 10%, transparent)" }
                  : dotColor
                  ? {
                      backgroundColor: `color-mix(in oklab, ${dotColor} ${isActive ? "20%" : "10%"}, transparent)`,
                      color: `color-mix(in oklab, ${dotColor} ${isActive ? "100%" : "50%"}, transparent)`,
                    }
                  : undefined
              }
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}