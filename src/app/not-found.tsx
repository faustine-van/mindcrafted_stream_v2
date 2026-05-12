import Link from 'next/link'
import { ArrowLeft, Film } from 'lucide-react'
import { Logo } from '@/app/components/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">

        
          {/* 404 */}
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            404 — Page not found
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            This scene doesn&apos;t exist
          </h1>

          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            The page you&apos;re looking for has been removed, renamed, or never existed.
            Let&apos;s get you back to your watchlist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            >
              Go to homepage
            </Link>
            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition"
            >
              <ArrowLeft className="h-4 w-4" /> My watchlist
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mindcrafted Stream
        </p>
      </footer>

    </div>
  )
}
