import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ToastProvider from "@/components/ToastProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Ical Sync",
  description: "Sync calendars effortlessly",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Set theme ASAP to avoid white flash on first paint */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var d=document.documentElement;var t;try{t=localStorage.getItem('theme')}catch(e){};if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){d.setAttribute('data-theme','dark');}else{d.setAttribute('data-theme','light');}d.style.colorScheme=d.getAttribute('data-theme');if(d.getAttribute('data-theme')==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`}
        </Script>
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <header className="site-header sticky top-0 z-40 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">Ical Sync</Link>
            <nav className="flex items-center gap-4 text-sm">
              <ThemeToggle />
              <Link href="/login" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-neutral-800">Login</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12 sm:py-14">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Ical Sync</p>
        </footer>
      </body>
    </html>
  );
}
