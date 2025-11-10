import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ToastProvider from "@/components/ToastProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Ical Sync — Best calendar manager for your property",
    template: "%s • Ical Sync",
  },
  description: "Ical Sync: the best calendar manager for your property. Sync Airbnb/Booking.com calendars, block dates, and export iCal feeds effortlessly.",
  openGraph: {
    title: "Ical Sync — Best calendar manager for your property",
    description: "Ical Sync: the best calendar manager for your property. Sync Airbnb/Booking.com calendars, block dates, and export iCal feeds effortlessly.",
    url: "/",
    siteName: "Ical Sync",
    images: [
      {
        url: "/vercel.svg",
        width: 1200,
        height: 630,
        alt: "Ical Sync",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ical Sync — Best calendar manager for your property",
    description: "Ical Sync: the best calendar manager for your property. Sync Airbnb/Booking.com calendars, block dates, and export iCal feeds effortlessly.",
    images: ["/vercel.svg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Set theme ASAP to avoid white flash on first paint */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var d=document.documentElement;var t;try{t=localStorage.getItem('theme')}catch(e){};if(t==='light'||t==='dark'){d.setAttribute('data-theme',t);}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){d.setAttribute('data-theme','dark');}else{d.setAttribute('data-theme','light');}d.style.colorScheme=d.getAttribute('data-theme');if(d.getAttribute('data-theme')==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`}
        </Script>
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
        <header className="site-header sticky top-0 z-40 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">Ical Sync</Link>
            <nav className="flex items-center gap-2 sm:gap-4 text-sm">
              <Link href="/#features" className="hidden md:inline hover:underline">Features</Link>
              <Link href="/#how-it-works" className="hidden md:inline hover:underline">How it works</Link>
              <Link href="/#contact" className="hidden md:inline hover:underline">Contact</Link>
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-transform">Dashboard</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-transform">Logout</button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-transform">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-14">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Ical Sync · 
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@icalsync.app"}`}
              className="underline hover:text-gray-700 dark:hover:text-gray-200"
            >
              Support
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
