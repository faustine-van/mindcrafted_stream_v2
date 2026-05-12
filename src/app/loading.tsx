export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing logo-coloured ring */}
        <div
          className="h-12 w-12 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "#8B5CF6",
            borderRightColor: "#8B5CF620",
          }}
        />
        <p className="text-xs text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}