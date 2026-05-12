export default function WatchlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">

      {/* Welcome row skeleton */}
      <div className="space-y-2">
        <div className="h-5 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>

      {/* Featured banner skeleton */}
      <div className="h-[280px] md:h-[320px] rounded-2xl bg-muted animate-pulse" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-12 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-[2/3] bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-5 bg-muted rounded-full animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}