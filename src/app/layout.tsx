import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mindcrafted.stream";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Mindcrafted Stream — Your personal watchlist",
    template: "%s · Mindcrafted Stream",
  },
  description:
    "A calm, focused watchlist for the movies and TV shows you love — and the ones still waiting their turn. Free, ad-free, and entirely yours.",
    keywords: ["watchlist", "movies", "tv shows", "film tracker", "personal streaming"],
  authors: [{ name: "Mindcrafted Stream" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Mindcrafted Stream",
    title: "Mindcrafted Stream — Your personal watchlist",
    description:
      "A calm, focused watchlist for the movies and TV shows you love — and the ones still waiting their turn.",
    images: [
      {
        url: "/og-image.png",   // add a 1200×630 image to /public
        width: 1200,
        height: 630,
        alt: "Mindcrafted Stream",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindcrafted Stream — Your personal watchlist",
    description: "A calm, focused watchlist for movies and TV shows.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}