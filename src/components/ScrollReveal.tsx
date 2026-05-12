"use client";

/**
 * ScrollReveal
 *
 * Uses the native CSS Scroll-Driven Animations API (animation-timeline: view())
 * — zero JavaScript, zero IntersectionObserver, zero layout thrash.
 *
 * Supported in Chrome 115+, Edge 115+, Safari 18+, Firefox 132+.
 * Falls back gracefully (elements are visible from the start) in older browsers.
 *
 * Usage:
 *   <ScrollReveal>
 *     <YourContent />
 *   </ScrollReveal>
 *
 *   <ScrollReveal variant="slide-left" delay="200">
 *     <YourContent />
 *   </ScrollReveal>
 */

import { CSSProperties } from "react";

type Variant =
  | "fade-up"       
  | "fade-down"   
  | "slide-left" 
  | "slide-right"
  | "scale-up" 
  | "fade"; 

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}

const KEYFRAMES: Record<Variant, { from: CSSProperties; to: CSSProperties }> = {
  "fade-up": {
    from: { opacity: "0", transform: "translateY(32px)" },
    to:   { opacity: "1", transform: "translateY(0)"   },
  },
  "fade-down": {
    from: { opacity: "0", transform: "translateY(-24px)" },
    to:   { opacity: "1", transform: "translateY(0)"     },
  },
  "slide-left": {
    from: { opacity: "0", transform: "translateX(-32px)" },
    to:   { opacity: "1", transform: "translateX(0)"     },
  },
  "slide-right": {
    from: { opacity: "0", transform: "translateX(32px)" },
    to:   { opacity: "1", transform: "translateX(0)"    },
  },
  "scale-up": {
    from: { opacity: "0", transform: "scale(0.94)" },
    to:   { opacity: "1", transform: "scale(1)"    },
  },
  "fade": {
    from: { opacity: "0" },
    to:   { opacity: "1" },
  },
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
}: Props) {
  const kf = KEYFRAMES[variant];

  const style = {
    ...kf.from,
    animationName: `sr-${variant}`,
    animationDuration: "0.6s",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", 
    animationFillMode: "both",
    animationDelay: delay ? `${delay}ms` : undefined,
    ["animationTimeline" as string]: "view()",
    ["animationRange" as string]: "entry 0% entry 30%",
  } as CSSProperties;

  return (
    <>
      
      <style>{`
        @keyframes sr-${variant} {
          from {
            opacity: ${kf.from.opacity ?? 1};
            transform: ${kf.from.transform ?? "none"};
          }
          to {
            opacity: ${kf.to.opacity ?? 1};
            transform: ${kf.to.transform ?? "none"};
          }
        }
        /* Respect reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          @keyframes sr-${variant} {
            from, to { opacity: 1; transform: none; }
          }
        }
      `}</style>
      <div style={style} className={className}>
        {children}
      </div>
    </>
  );
}