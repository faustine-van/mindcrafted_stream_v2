import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // Serve WebP/AVIF automatically
    formats: ["image/avif", "image/webp"],
  },

  // Strict mode catches issues early
  reactStrictMode: true,

  // Security headers applied at the Next.js layer (belt-and-suspenders
  // alongside the headers set in proxy.ts middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",     value: "nosniff"                       },
          { key: "X-Frame-Options",             value: "DENY"                          },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Silence Supabase realtime websocket errors in dev
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;