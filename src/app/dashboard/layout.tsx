"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type PageItem = { label: string; href: string; kind?: "link" | "action" };

const PAGES: PageItem[] = [
  { label: "Home", href: "/dashboard" },
  { label: "Properties", href: "/dashboard/properties" },
  { label: "Calendar", href: "/dashboard/calendar" },
  { label: "Settings", href: "/dashboard/settings" },
  // Logout is rendered as a form action in both mobile dropdown and desktop list
];

function useCurrentPage() {
  const pathname = usePathname();
  const match = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const current = useMemo(() => {
    const matches = PAGES.filter((p) => match(p.href));
    if (matches.length === 0) return PAGES[0];
    // Prefer the most specific (longest) href so /dashboard/calendar wins over /dashboard
    return matches.sort((a, b) => b.href.length - a.href.length)[0];
  }, [pathname]);
  return { pathname, current };
}

function useAdmin(): { isAdmin: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const j = await res.json();
        const email: string | undefined = j?.user?.email;
        const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
        const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        setIsAdmin(!!email && admins.includes(email.toLowerCase()));
      } catch {}
    })();
  }, []);
  return { isAdmin };
}

function DesktopNav({ currentHref }: { currentHref: string }) {
  const { isAdmin } = useAdmin();
  const pages = isAdmin ? [...PAGES, { label: "Admin", href: "/dashboard/admin/upgrade-requests" }] : PAGES;
  return (
    <nav className="space-y-2 text-sm">
      {pages.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={
            "block rounded px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors " +
            (p.href === currentHref ? "bg-blue-600/10 text-blue-700 dark:text-blue-300" : "")
          }
        >
          {p.label}
        </Link>
      ))}
      <form action="/auth/signout" method="post">
        <button type="submit" className="w-full text-left rounded px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">Logout</button>
      </form>
    </nav>
  );
}

function MobileDropdown() {
  const router = useRouter();
  const { pathname, current } = useCurrentPage();
  const { isAdmin } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Order menu: current page first, then others
  const ordered = useMemo(() => {
    const base = isAdmin ? [...PAGES, { label: "Admin", href: "/dashboard/admin/upgrade-requests" }] : PAGES;
    const rest = base.filter((p) => p.href !== current.href);
    return [current, ...rest];
  }, [current, isAdmin]);

  // Close on outside click / ESC
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="md:hidden relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="dashboard-mobile-dropdown"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md bg-neutral-100 dark:bg-neutral-900/60 px-3 py-2 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span className="truncate">{current.label}</span>
        <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      <div
        id="dashboard-mobile-dropdown"
        role="menu"
        aria-label="Dashboard navigation"
        className={`absolute left-0 right-0 mt-2 origin-top rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden z-30 transition-all duration-150 ${open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
      >
        <ul className="max-h-80 overflow-auto py-1">
          {ordered.map((item) => {
            const active = item.href === current.href;
            return (
              <li key={item.href} role="none">
                <a
                  role="menuitemradio"
                  aria-checked={active}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    if (pathname !== item.href) router.push(item.href);
                  }}
                  className={
                    "flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors " +
                    (active ? "bg-blue-600/10 text-blue-700 dark:text-blue-300" : "")
                  }
                >
                  <span>{item.label}</span>
                  {active && (
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.42l2.543 2.543 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
          <li role="none" className="border-t border-neutral-200 dark:border-neutral-800 mt-1 pt-1">
            <form action="/auth/signout" method="post" role="none">
              <button
                type="submit"
                onClick={() => setOpen(false)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                role="menuitem"
              >
                Logout
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pathname, current } = useCurrentPage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside className="md:sticky md:top-20 h-fit rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        {/* Mobile dropdown (current page featured) */}
        <MobileDropdown />
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <DesktopNav currentHref={current.href} />
        </div>
      </aside>
      <section>
        {children}
      </section>
    </div>
  );
}