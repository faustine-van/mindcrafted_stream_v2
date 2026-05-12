import { ListVideo, Bookmark, Star, Search, Plus, Play, CheckCircle2 } from "lucide-react";

// ── Poster collage (hero) ──────────────────────────────────────────────────
export const collagePosterRows = [
  [
    "https://image.tmdb.org/t/p/w342/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    "https://image.tmdb.org/t/p/w342/lFf6LLrQjYldcZItzOkGmMMigP7.jpg",
    "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "https://image.tmdb.org/t/p/w342/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    "https://image.tmdb.org/t/p/w342/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    "https://image.tmdb.org/t/p/w342/7O4iVfOMQmdCSxhOg1WnzG1AlYP.jpg",
    "https://image.tmdb.org/t/p/w342/qNBAXBIQlnOThrVvA6mA2B5ggkl.jpg",
  ],
  [
    "https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "https://image.tmdb.org/t/p/w342/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    "https://image.tmdb.org/t/p/w342/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
    "https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    "https://image.tmdb.org/t/p/w342/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    "https://image.tmdb.org/t/p/w342/lEV8OVYreekf3bWqQJeGkGF0rQT.jpg",
    "https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  ],
] as const;

// ── Feature cards ──────────────────────────────────────────────────────────
export const features = [
  {
    icon: ListVideo,
    title: "One unified library",
    desc: "Movies and shows side-by-side. No more juggling apps.",
  },
  {
    icon: Bookmark,
    title: "Three simple statuses",
    desc: "Watching, Watched, or Want to Watch — nothing more.",
  },
  {
    icon: Star,
    title: "Rate what matters",
    desc: "A clean 1–5 star system so you remember what you loved.",
  },
  {
    icon: Search,
    title: "Find it instantly",
    desc: "Search and filter your library in one click.",
  },
] as const;

// ── How it works steps ─────────────────────────────────────────────────────
export const howItWorksSteps = [
  {
    num: "1",
    icon: Plus,
    title: "Add a title",
    desc: "Search for any movie or show and add it in seconds. Poster, rating, and genre are pulled in automatically.",
    tag: "Powered by TMDB",
  },
  {
    num: "2",
    icon: Play,
    title: "Set its status",
    desc: "Mark it Watching, Watched, or Want to watch. Update as you go — it takes one tap.",
    tag: null,
  },
  {
    num: "3",
    icon: CheckCircle2,
    title: "Rate & reflect",
    desc: "Give it stars when you're done. Over time your library becomes a real record of your taste — not just a list.",
    tag: null,
  },
] as const;