import type { WatchStatus } from "@/app/(watchlist)/watchlist/components/WatchCard";

/** Map our UI WatchStatus → DB watch_status string */
export function toDbStatus(status: WatchStatus): string {
  switch (status) {
    case "Watching":      return "watching";
    case "Watched":       return "watched";
    case "Want to Watch": return "want_to_watch";
  }
}

/** Map DB watch_status → UI WatchStatus (with boolean fallback for old rows) */
export function fromDbStatus(
  watchStatus: string | null,
  watchedBool: boolean
): WatchStatus {
  switch (watchStatus) {
    case "watching":      return "Watching";
    case "watched":       return "Watched";
    case "want_to_watch": return "Want to Watch";
    default:
      return watchedBool ? "Watched" : "Want to Watch";
  }
}