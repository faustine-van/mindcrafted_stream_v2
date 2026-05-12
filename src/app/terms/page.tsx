import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, ScrollText } from "lucide-react";

const LAST_UPDATED = "May 2026";

const sections = [
  {
    title: "The short version",
    body: `Mindcrafted Stream is a free personal watchlist app. You can use it to track movies and TV shows you've watched, are watching, or want to watch. Be respectful, don't abuse the service, and you're welcome here.`,
  },
  {
    title: "Your account",
    body: `You must be 13 or older to create an account. You are responsible for keeping your login credentials secure. If you believe your account has been compromised, change your password immediately from your profile page.

You may only have one account. Creating multiple accounts to circumvent any limitations is not permitted.`,
  },
  {
    title: "What you can do",
    body: `You can use Mindcrafted Stream to build and manage a personal watchlist, rate titles, write personal notes, and browse trending content powered by TMDB.

You can export or delete your data at any time. Deleting your account removes all your data permanently.`,
  },
  {
    title: "What you cannot do",
    body: `You may not use the service to scrape data, reverse-engineer the application, attempt to gain unauthorised access to other users' data, or use automated tools to add items at scale.

You may not use the service for any unlawful purpose or in a way that could harm other users or the integrity of the platform.`,
  },
  {
    title: "Content you create",
    body: `Personal notes and ratings you write belong to you. By saving them you grant us the right to store and display them back to you as part of the service. We do not claim ownership of your content and do not share it with other users unless you enable a public profile.`,
  },
  {
    title: "Third-party content",
    body: `Movie metadata, posters, and ratings are provided by The Movie Database (TMDB) under their terms of use. We are not affiliated with TMDB. Mindcrafted Stream uses the TMDB API but is not endorsed or certified by TMDB.

TMDB logo and branding are trademarks of TMDB.`,
  },
  {
    title: "Service availability",
    body: `We provide the service on an "as is" basis. We aim for high availability but cannot guarantee uninterrupted access. We may modify or discontinue features at any time.

We will give reasonable notice before any major change that affects existing functionality, where possible.`,
  },
  {
    title: "Limitation of liability",
    body: `Mindcrafted Stream is a free service provided without warranty. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.

Our total liability to you for any claim arising from these terms shall not exceed the amount you paid us in the past twelve months — which, since the service is free, is zero.`,
  },
  {
    title: "Termination",
    body: `You can stop using the service and delete your account at any time. We reserve the right to suspend or terminate accounts that violate these terms, with or without prior notice depending on the severity of the violation.`,
  },
  {
    title: "Governing law",
    body: `These terms are governed by the laws of the jurisdiction in which Mindcrafted Stream operates. Any disputes will be resolved in the courts of that jurisdiction.`,
  },
  {
    title: "Changes to these terms",
    body: `We may update these terms from time to time. We will update the "Last updated" date and notify you of material changes by email where appropriate. Continued use of the service after changes constitutes acceptance of the new terms.`,
  },
  {
    title: "Contact",
    body: `Questions about these terms? Email us at faustinemuhayemariya44@gmail.com. We aim to respond within 5 business days.`,
  },
];

export default function TermsPage() {
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
            <ScrollText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-base text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border">
          By using Mindcrafted Stream you agree to these terms. We've written them
          in plain language — no legalese. If something's unclear, just ask.
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}