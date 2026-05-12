"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 grid place-items-center mb-6">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="font-serif text-2xl font-semibold mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        An unexpected error occurred. It&apos;s been noted and we&apos;ll look into it.
        {error.digest && (
          <span className="block mt-1 font-mono text-xs opacity-60">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center h-10 px-4 rounded-xl border border-border text-sm hover:bg-muted transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}