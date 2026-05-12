import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { ScrollReveal } from "@/components/ScrollReveal";

interface Props {
  isLoggedIn: boolean;
}

export function Footer({ isLoggedIn }: Props) {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="space-y-2 max-w-xs">
              <Logo />
              <p className="text-xs text-muted-foreground leading-relaxed">
                A calm, focused watchlist for the things you love watching — and the ones still waiting their turn.
              </p>
            </div>
            <div className="flex gap-12 text-xs text-muted-foreground">
              <div className="space-y-2.5">
                <p className="font-medium text-foreground">Product</p>
                {isLoggedIn ? (
                  <Link href="/watchlist" className="block hover:text-foreground transition-colors">My watchlist</Link>
                ) : (
                  <>
                    <Link href="/signup" className="block hover:text-foreground transition-colors">Sign up</Link>
                    <Link href="/login" className="block hover:text-foreground transition-colors">Sign in</Link>
                  </>
                )}
              </div>
              <div className="space-y-2.5">
                <p className="font-medium text-foreground">Legal</p>
                <Link href="/privacy" className="block hover:text-foreground transition-colors">Privacy policy</Link>
                <Link href="/terms" className="block hover:text-foreground transition-colors">Terms of service</Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-medium text-foreground">Data</p>
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-foreground transition-colors"
                >
                  Powered by TMDB
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Mindcrafted Stream. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Free forever · No ads · No tracking</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>
                Developed by{" "}
                <a
                  href="https://github.com/faustine-van"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors underline underline-offset-2 decoration-border hover:decoration-foreground"
                >
                  Faustine
                </a>
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}