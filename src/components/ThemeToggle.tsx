"use client";
import { useEffect, useState } from "react";

function applyTheme(next: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = next;
  // Best-effort support for projects that use `dark:` variants
  // (will only work if Tailwind is configured with darkMode: "class").
  if (next === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  // Hint the UA for built-in form controls, scrollbars, etc.
  (root as any).style.colorScheme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure client-only logic runs after first paint to avoid hydration mismatch.
    setMounted(true);
    try {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        applyTheme(saved);
        return;
      }
    } catch {}
    // Fallback to DOM attribute or system preference
    const domTheme = (typeof document !== "undefined" && document.documentElement.dataset.theme) as
      | "light"
      | "dark"
      | undefined;
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = domTheme || (prefersDark ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-150 hover:-translate-y-[0.5px] hover:shadow-sm active:translate-y-0 ${className}`}
    >
      {mounted ? (
        theme === "dark" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M21.64 13.64A9 9 0 1 1 10.36 2.36 7 7 0 1 0 21.64 13.64z"/></svg>
            <span className="hidden sm:inline">Dark</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.84 17.24l-1.79 1.8 1.79 1.79 1.79-1.79-1.79-1.8zM13 1h-2v3h2V1zm7.03 3.05l-1.79 1.79 1.79 1.79 1.79-1.79-1.79-1.79zM20 11v2h3v-2h-3zm-7 6a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm3.24 3.16l1.8 1.79 1.79-1.79-1.79-1.8-1.8 1.8z"/></svg>
            <span className="hidden sm:inline">Light</span>
          </>
        )
      ) : (
        <>
          {/* Neutral icon to match on server and initial client render */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><circle cx="12" cy="12" r="5" /></svg>
          <span className="hidden sm:inline">Theme</span>
        </>
      )}
    </button>
  );
}