import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import ToastProvider from "@/components/ToastProvider";
import AnimatedHeader from "@/components/AnimatedHeader";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.icalsync.app"),
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
        <AnimatedHeader isLoggedIn={!!user} />
        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-14">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10 text-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="text-base font-semibold text-neutral-800 dark:text-neutral-100">Ical Sync</div>
                <div className="mt-1 text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} All rights reserved</div>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
                <Link href="/about" className="hover:text-gray-800 dark:hover:text-gray-200">About</Link>
                <Link href="/privacypolicy" className="hover:text-gray-800 dark:hover:text-gray-200">Privacy Policy</Link>
                <Link href="/termsandconditions" className="hover:text-gray-800 dark:hover:text-gray-200">Terms & Conditions</Link>
                <Link href="/refundpolicy" className="hover:text-gray-800 dark:hover:text-gray-200">Refund & Cancellation</Link>
                <Link href="/contactus" className="hover:text-gray-800 dark:hover:text-gray-200">Contact</Link>
              </nav>
              <div className="text-center sm:text-right">
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "icalsync.app@gmail.com"}`}
                  className="inline-flex items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  <span>Support</span>
                  <span className="underline">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "icalsync.app@gmail.com"}</span>
                </a>
              </div>
            </div>
            <div className="mt-6 text-center space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">Powered by</div>
              <a
                href="https://staywithseasons.com/?utm_source=icalsync&utm_medium=website&utm_campaign=landing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-white/80 dark:bg-white/10 px-4 py-2 ring-1 ring-neutral-200 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/15 transition shadow-sm"
                aria-label="Powered by Seasons"
              >
                <Image src="/seasons-logo.png" alt="Seasons" width={120} height={30} />
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
