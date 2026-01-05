"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
// Load ThemeToggle on the client only to avoid SSR/client markup drift
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), { ssr: false });

export default function AnimatedHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [compact, setCompact] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> hero, 1 -> compact
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastY, setLastY] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const pathname = usePathname();
  const inDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/dashboard/");

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
      const w = containerRef.current?.offsetWidth ?? window.innerWidth;
      setContainerWidth(w);
    };
    const onScroll = () => {
      const y = window.scrollY || 0;
      const down = y > lastY;
      setIsScrollingDown(down);
      setLastY(y);

      if (isMobile) {
        setCompact(false);
        setProgress(0);
        return;
      }

      const p = Math.min(1, y / 160); // contract over ~160px scroll for gentler change
      setProgress(p);
      // Only contract while scrolling down; expand when scrolling up
      setCompact(down && p > 0.35);
    };
    onScroll();
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 pointer-events-none">
      <div
        ref={containerRef}
        className={
          "max-w-6xl mx-auto px-3 sm:px-4 transition-all duration-200 " +
          (compact && !isMobile ? "my-2" : "mt-4")
        }
      >
        <div
          className={
            "pointer-events-auto flex items-center justify-between transition-all duration-200 backdrop-blur mx-auto overflow-hidden " +
            (compact && !isMobile
              ? [
                  "ring-1",
                  "bg-white/80 text-neutral-900",
                  // dark: neutral glass, no color cast
                  "dark:bg-neutral-900/70 dark:text-white",
                  "ring-neutral-200 dark:ring-white/10",
                  "shadow-sm",
                ].join(" ")
              : [
                  "ring-1",
                  "bg-white/90 text-neutral-900",
                  // dark: neutral glass, slightly brighter
                  "dark:bg-neutral-900/65 dark:text-white",
                  "ring-neutral-200 dark:ring-white/15",
                  "shadow-lg",
                ].join(" ")
            )
          }
          style={{
            // target compact width around 560–720px, interpolated from container width
            width:
              !isMobile && containerWidth
                ? `${Math.min(
                    containerWidth,
                    Math.max(560, Math.min(720, containerWidth * 0.62)) * progress +
                      containerWidth * (1 - progress)
                  )}px`
                : undefined,
            // smoothly contract height and radius with scroll progress (desktop only)
            height: isMobile ? 60 : `${72 - 20 * progress}px`, // 72 -> 52
            borderRadius: isMobile ? 28 : `${32 - 10 * progress}px`,
            transform: isMobile
              ? "none"
              : `translateY(${2 * progress}px) scale(${1 - 0.02 * progress})`,
            transitionProperty:
              "width, height, border-radius, transform, background-color, box-shadow",
            transitionDuration: "200ms",
          }}
        >
          <div className="flex items-center gap-2 pl-4">
            <Link href="/" className={compact ? "font-semibold" : "font-semibold dark:text-white"}>Ical Sync</Link>
          </div>
          <nav className="flex items-center gap-1.5 sm:gap-2.5 text-sm pr-3 sm:pr-4">
          {/* Desktop full nav when not compact or scrolling up */}
          {!isMobile && !(compact && isScrollingDown) && !inDashboard && (
            <>
              <Link href="/#features" className="hidden md:inline hover:underline dark:text-white/90">Features</Link>
              <Link href="/#how-it-works" className="hidden md:inline hover:underline dark:text-white/90">How it works</Link>
              <Link href="/contactus" className="hidden md:inline hover:underline dark:text-white/90">Contact</Link>
            </>
          )}
          {!isMobile && !(compact && isScrollingDown) && <ThemeToggle />}

          {isMobile && <ThemeToggle className="mr-1" />}

            {/* Minimal nav while scrolling down (desktop) */}
            {!isMobile && compact && isScrollingDown && (
              <div className="flex-1" />
            )}

            {/* Auth button stays visible */}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={
                  "rounded-full px-3 py-1.5 transition-all duration-150 hover:-translate-y-[0.5px] hover:shadow-sm " +
                  (compact && !isMobile
                    ? "bg-white/70 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white/80 dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/15"
                    : "bg-white/80 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white/90 dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/15")
                }
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={
                  "rounded-full px-3 py-1.5 transition-all duration-150 hover:-translate-y-[0.5px] hover:shadow-sm " +
                  (compact && !isMobile
                    ? "bg-white/70 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white/80 dark:bg:white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/15"
                    : "bg-white/80 text-neutral-900 ring-1 ring-neutral-200 hover:bg-white/90 dark:bg:white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/15")
                }
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
