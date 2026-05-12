export function RowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden pb-1">
      {Array.from({ length: count }, (_, i) => (
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