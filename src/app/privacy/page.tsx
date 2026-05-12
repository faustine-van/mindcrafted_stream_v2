import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Shield } from "lucide-react";

const LAST_UPDATED = "May 2026";

const sections = [
  {
    title: "What we collect",
    body: `When you create an account we collect your email address and any display name you choose to set. When you add items to your watchlist we store the title, type, status, rating, and any personal notes you write. We also store the timestamps of when items were added or updated.

We do not collect your browsing history, location, device fingerprint, or any information beyond what you explicitly provide.`,
  },
  {
    title: "How we use it",
    body: `Your data is used solely to provide the service — displaying your watchlist, powering recommendations based on your favorites and watched titles, and sending the occasional email if you opt in to notifications.

We do not sell your data. We do not share it with advertisers. We do not use it to build profiles for third parties.`,
  },
  {
    title: "Third-party services",
    body: `Movie and TV metadata (posters, ratings, descriptions) is sourced from The Movie Database (TMDB). When you search for a title, your search query is sent to TMDB's API. TMDB has its own privacy policy at themoviedb.org.

Your account and watchlist data is stored in Supabase, a hosted Postgres database. Supabase is SOC 2 Type II compliant. Data is stored in the EU-West region by default.`,
  },
  {
    title: "Cookies and storage",
    body: `We use a single session cookie to keep you logged in. We also use localStorage to remember your preferred sort order and view mode in the watchlist — this data never leaves your device.

We do not use tracking cookies, analytics cookies, or advertising cookies.`,
  },
  {
    title: "Your rights",
    body: `You can update your display name at any time from your profile page. You can delete individual watchlist items at any time. You can delete your entire account and all associated data from the Danger zone section of your profile — deletion is immediate and permanent.

If you have questions about your data or want a copy of it, contact us at the address below.`,
  },
  {
    title: "Data retention",
    body: `Active account data is retained for as long as your account exists. When you delete your account, all watchlist items, notes, ratings, and personal settings are permanently deleted within 24 hours.

Anonymised, aggregated statistics (total titles tracked across all users, average ratings) may be retained indefinitely as they contain no personal information.`,
  },
  {
    title: "Security",
    body: `Passwords are never stored in plain text — authentication is handled by Supabase Auth which uses bcrypt hashing. All data in transit is encrypted via TLS. All database access is protected by row-level security policies so each user can only access their own data.`,
  },
  {
    title: "Changes to this policy",
    body: `If we make material changes to this policy we will update the "Last updated" date at the top of this page and, where appropriate, notify you by email. Continued use of the service after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact",
    body: `Questions about this policy or your data? Email us at faustinemuhayemariya44@gmail.com. We aim to respond within 5 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link href="/" aria-label="Home"><Logo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        {/* Title block */}
        <div className="flex items-start gap-4 mb-12">
          <div
            className="h-12 w-12 rounded-2xl grid place-items-center shrink-0 mt-0.5"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-base text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border">
          Mindcrafted Stream is a personal watchlist tool. We collect the minimum
          data needed to make it work, we don't sell it, and we give you full
          control over it. Here's the full picture.
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} className="grid sm:grid-cols-[180px_1fr] gap-4 sm:gap-8">
              <div className="flex items-start gap-2.5 sm:pt-0.5">
                <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums mt-1 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-sm font-semibold leading-snug">{s.title}</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Mindcrafted Stream</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of service</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}