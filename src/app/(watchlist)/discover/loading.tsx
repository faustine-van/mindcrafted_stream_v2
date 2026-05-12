function PosterRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[130px] sm:w-[150px]">
          <div className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          <div className="mt-2 space-y-1.5">
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-12">

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-8 w-36 bg-muted rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Trending skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        <PosterRowSkeleton />
      </div>

      {/* Top rated skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        <PosterRowSkeleton />
      </div>
    </div>
  );
}