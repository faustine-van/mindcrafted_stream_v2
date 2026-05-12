import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header: logo + theme toggle */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered auth content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-14">
        {children}
      </main>
    </div>
  );
}