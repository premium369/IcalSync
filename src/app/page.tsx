"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { plansCatalog } from "@/lib/plans";

export default function Home() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "icalsync.app@gmail.com";
  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    const subject = encodeURIComponent(`Contact from ${contactName || "Website visitor"}`);
    const body = encodeURIComponent(`Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`);
    // Simple mailto submission; can be replaced by API later
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setTimeout(() => setContactSubmitting(false), 500);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero */}
      <section className="relative">
        {/* Refined blue backdrop: sky + indigo accents */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(800px_350px_at_20%_-10%,rgba(2,132,199,0.16),transparent_60%),radial-gradient(700px_300px_at_110%_0%,rgba(79,70,229,0.14),transparent_60%)]" aria-hidden />
        <div className="mx-auto max-w-5xl px-6 pt-12 sm:pt-16 pb-6 sm:pb-8 text-center relative">
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400 tracking-wide uppercase">Calendar sync for short-term rentals</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Keep your Airbnb, Vrbo and other OTA’s calendars updated automatically
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            No more double bookings. Your availability stays accurate across all platforms, all the time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/auth/demo-login"
              className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0 btn-shimmer pulse-soft whitespace-nowrap"
            >
              Try demo
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
            >
              See how it works
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-md border border-blue-200 dark:border-indigo-800 px-5 py-2.5 text-sm font-medium bg-blue-50/60 dark:bg-indigo-950/40 text-blue-700 dark:text-indigo-300 hover:bg-blue-100 dark:hover:bg-indigo-900 hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px] whitespace-nowrap"
            >
              See pricing
            </a>
            <span className="basis-full text-xs text-gray-600 dark:text-gray-400 mt-2">No signup needed • Instant demo</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-2"><span aria-hidden>🔄</span>Airbnb + Booking.com + Other OTA’s sync</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden>🛑</span>Auto block dates • Multiple properties</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden>📊</span>One simple dashboard</span>
          </div>
        </div>
        {/* Slim social proof bar under hero */}
        <div className="mx-auto max-w-5xl px-6 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-2"><span aria-hidden>👍</span>Trusted by hosts</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden>⚡</span>Fast to set up</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden>✅</span>Reliable syncing (ICAL)</span>
          </div>
        </div>
      </section>

      {/* Trust avatars */}
      <section aria-labelledby="trust-logos" className="text-center">
        <h2 id="trust-logos" className="sr-only">Trusted by hosts</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by hosts who sync their calendars every day</p>
        <div className="mt-4 flex justify-center">
          <div className="flex -space-x-3 items-center">
            <img src="https://i.pravatar.cc/80?img=12" alt="Host avatar" loading="lazy" className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=28" alt="Host avatar" loading="lazy" className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=45" alt="Host avatar" loading="lazy" className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=66" alt="Host avatar" loading="lazy" className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=3" alt="Host avatar" loading="lazy" className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <span className="inline-flex items-center h-10 rounded-full bg-neutral-900 text-white text-xs px-3 ring-2 ring-white dark:ring-neutral-900">+89 hosts</span>
          </div>
        </div>
      </section>

      {/* Benefits marquee */}
      <section aria-label="Benefits" className="card-surface py-3 overflow-hidden">
        <div className="marquee">
          <div className="marquee-track">
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🔒</span>Your data stays private</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🛎️</span>Instant alerts</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>📅</span>Unified calendar view</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✨</span>No double bookings</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>⚡</span>Fast setup</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✅</span>Reliable syncing</span>
            {/* duplicate for seamless scroll */}
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🔒</span>Your data stays private</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🛎️</span>Instant alerts</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>📅</span>Unified calendar view</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✨</span>No double bookings</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>⚡</span>Fast setup</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✅</span>Reliable syncing</span>
          </div>
        </div>
      </section>

      {/* Problem & Promise */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_250px_at_80%_0%,rgba(2,132,199,0.12),transparent_60%),radial-gradient(700px_300px_at_0%_20%,rgba(79,70,229,0.10),transparent_60%)]" aria-hidden />
        <div className="mx-auto max-w-5xl px-6 py-10 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">All your bookings, In one place</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Keeping your availability updated across Airbnb, Vrbo, and other platforms can take more time than hosting itself.</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">iCal Sync handles all of it for you. It blocks dates, updates your calendars, and keeps everything in sync so you never double book.</p>
            </div>
            {/* Simple "calendar mess" illustration */}
            <div className="card-surface p-4">
              <div className="grid grid-cols-7 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                <div className="text-center">Mon</div><div className="text-center">Tue</div><div className="text-center">Wed</div><div className="text-center">Thu</div><div className="text-center">Fri</div><div className="text-center">Sat</div><div className="text-center">Sun</div>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                <div className="col-span-2 bg-[#FF5A5F] text-white rounded-md px-2 py-1 text-[11px]">Airbnb</div>
                <div className="col-start-4 col-span-3 bg-[#0A5D9A] text-white rounded-md px-2 py-1 text-[11px]">Vrbo</div>
                <div className="col-start-3 col-span-2 bg-amber-500 text-white rounded-md px-2 py-1 text-[11px]">Cleaning</div>
                <div className="col-start-6 col-span-2 bg-red-600 text-white rounded-md px-2 py-1 text-[11px]">Conflict</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported OTAs */}
      <section aria-labelledby="supported-otas" className="text-center">
        <h2 id="supported-otas" className="sr-only">Supported OTAs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Works with Airbnb, Booking.com, Vrbo, Expedia, Tripadvisor and more</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#FF5A5F] text-white px-3 py-1 text-sm shadow-sm">Airbnb</span>
          <span className="inline-flex items-center rounded-full bg-[#003580] text-white px-3 py-1 text-sm shadow-sm">Booking.com</span>
          <span className="inline-flex items-center rounded-full bg-[#0A5D9A] text-white px-3 py-1 text-sm shadow-sm">Vrbo</span>
          <span className="inline-flex items-center rounded-full bg-[#F5C518] text-black px-3 py-1 text-sm shadow-sm">Expedia</span>
          <span className="inline-flex items-center rounded-full bg-[#34E0A1] text-black px-3 py-1 text-sm shadow-sm">Tripadvisor</span>
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Others</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Everything you need to stay in sync</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Simple setup. Real‑time updates. Zero headaches.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>🔁</div>
            <h3 className="mt-3 font-semibold">Two‑way iCal sync</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Keep your Airbnb, Booking.com and other OTA’s calendars aligned in real time.</p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>⛔</div>
            <h3 className="mt-3 font-semibold">Auto‑block dates</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">New reservation? We instantly block the dates on your other calendars.</p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>📥</div>
            <h3 className="mt-3 font-semibold">Easy imports</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Paste your iCal URLs and you’re connected in seconds—no complex setup.</p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>🗂️</div>
            <h3 className="mt-3 font-semibold">Unified view</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">See every property and reservation in a single, clean calendar.</p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>🔔</div>
            <h3 className="mt-3 font-semibold">Alerts & conflicts</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Get notified about new bookings and potential conflicts so you can act fast.</p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl" aria-hidden>🏘️</div>
            <h3 className="mt-3 font-semibold">Scale with properties</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Manage multiple listings effortlessly with a dashboard built for speed.</p>
          </div>
        </div>
      </section>

      {/* Product mock screenshot section */}
      <section aria-labelledby="product-mock" className="relative">
        <h2 id="product-mock" className="sr-only">Product preview</h2>
        <div className="mx-auto max-w-5xl px-6">
          <div className="card-surface overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 h-10 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-3">
              <div className="h-2 w-2 rounded-full bg-red-400 mr-1" />
              <div className="h-2 w-2 rounded-full bg-yellow-400 mr-1" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-600 dark:text-gray-400">Unified Calendar</span>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 card-surface p-3 sm:p-4">
                  <a href="/auth/demo-login" className="group block">
                    <DashboardSnapshot />
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span aria-hidden>👆</span>
                      <span>Click to open the live demo dashboard</span>
                    </div>
                  </a>
                </div>
                <div className="card-surface p-3 sm:p-4">
                  <ul className="space-y-2 text-sm sm:text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span aria-hidden>📍</span>
                      <div>
                        <div className="text-sm font-medium">All bookings in one place</div>
                        <div>See every reservation from every platform in a single clean calendar.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden>✅</span>
                      <div>
                        <div className="text-sm font-medium">No more double bookings</div>
                        <div>We catch overlaps early so you never confirm two guests for the same dates.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden>📱</span>
                      <div>
                        <div className="text-sm font-medium">Stop checking multiple apps</div>
                        <div>Your dates stay updated everywhere, automatically.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span aria-hidden>🧹</span>
                      <div>
                        <div className="text-sm font-medium">Always know what’s happening</div>
                        <div>Cleaning days, blocked dates and new bookings show up instantly.</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">How it works</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Three quick steps to keep everything in sync.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>①</div>
            <h3 className="mt-3 font-semibold">Add your property</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Set up your listing in the dashboard in just a few seconds.</p>
          </div>
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>②</div>
            <h3 className="mt-3 font-semibold">Connect with your iCal links</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Paste your Airbnb, Vrbo or Booking.com iCal URLs to link your calendars.</p>
          </div>
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>③</div>
            <h3 className="mt-3 font-semibold">Sync everything instantly</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Your bookings update everywhere automatically — no manual work needed.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Simple, fair pricing</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Made for small hosts — scale when you need.</p>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-gradient-to-b from-blue-50/50 to-indigo-50/40 dark:from-neutral-900 dark:to-neutral-900 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plansCatalog.map((p) => (
              <div key={p.id} className="card-surface overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800 hover:shadow-lg hover:scale-[1.01] transition-transform">
                <div className={`h-2 bg-gradient-to-r ${p.id==='basic' ? 'from-green-400 to-sky-400' : p.id==='super_host' ? 'from-indigo-500 to-fuchsia-500' : 'from-slate-400 to-gray-600'}`} aria-hidden />
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p.title}</h3>
                      {p.id === 'super_host' && (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 text-[11px] ring-1 ring-indigo-200 dark:ring-indigo-800">Popular</span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{p.price}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{p.propertyLimitLabel}</div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">Support: {p.support}</div>
                  <ol className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal pl-5">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    <li key={`extra-${p.id}`}>{extraPricingFeatures[p.id]}</li>
                  </ol>
                  <a href="/auth/demo-login" className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white text-sm font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">{p.cta}</a>
                </div>
              </div>
            ))}
          </div>
          </div>
          {/* Removed trial mention per request; keep helpful interoperability note if desired */}
          {/* <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">Airbnb sync works by default. Vrbo works when each property is listed individually. Booking.com support coming soon.</p> */}
        </div>
      </section>

      {/* Sticky mobile CTA: iOS-style glass floating bar with auto-hide on scroll */}
      <div className="md:hidden fixed inset-x-3 sm:inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+8px)] z-50 pointer-events-none transition-all duration-300 translate-y-0 opacity-100">
        <div className="pointer-events-auto relative rounded-2xl bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl ring-1 ring-white/60 dark:ring-neutral-700/50 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 px-4 py-3 max-[360px]:px-3 max-[360px]:py-2">
            <div className="text-[11px] text-gray-800 dark:text-gray-200 max-[360px]:hidden">Instant demo • No signup required</div>
            <a
              href="/auth/demo-login"
              className="ml-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-xs font-semibold shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 btn-shimmer max-[360px]:px-2 max-[360px]:py-1 max-[360px]:text-[11px]"
            >
              <span aria-hidden>🚀</span>
              <span className="ml-1">Try demo</span>
            </a>
          </div>
          {/* subtle inner ring for glass effect */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30 dark:ring-white/10 pointer-events-none" aria-hidden />
        </div>
      </div>
      {/* Spacer so bottom content isn't hidden behind the floating CTA */}
      <div className="md:hidden h-[calc(env(safe-area-inset-bottom)+48px)]" aria-hidden />

      {/* Removed duplicate pricing section; expanded first pricing above */}

      {/* Testimonials + mid-page CTA */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Loved by hosts</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Real results from real properties.</p>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-surface p-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/80?img=18" className="h-8 w-8 rounded-full" alt="Host" />
                <div>
                  <div className="text-sm font-medium">Ava, Superhost</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Airbnb & Booking.com</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-800 dark:text-gray-300">“Setup took minutes and we haven’t had a single overlap since.”</p>
            </div>
            <div className="card-surface p-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/80?img=7" className="h-8 w-8 rounded-full" alt="Host" />
                <div>
                  <div className="text-sm font-medium">Leo, Property Manager</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">10+ listings</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-800 dark:text-gray-300">“Finally a simple calendar that just stays in sync—huge time saver.”</p>
            </div>
            <div className="card-surface p-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/80?img=36" className="h-8 w-8 rounded-full" alt="Host" />
                <div>
                  <div className="text-sm font-medium">Maya, Boutique Host</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Vrbo & Airbnb</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-800 dark:text-gray-300">“We stopped worrying about double bookings. The alerts are spot on.”</p>
            </div>
            <div className="card-surface p-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/80?img=21" className="h-8 w-8 rounded-full" alt="Host" />
                <div>
                  <div className="text-sm font-medium">Noah, Agency Owner</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">25 properties</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-800 dark:text-gray-300">“The unified view is a game changer for our day‑to‑day ops.”</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 text-center">
            <a
              href="/auth/demo-login"
              className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl btn-shimmer whitespace-nowrap"
            >
              🚀 Try demo
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      <section id="our-story" className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Our story</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Built by a host, for hosts.</p>
        </div>
        <div className="mx-auto max-w-3xl px-6">
          <div className="card-surface p-6 sm:p-8">
            <div className="sm:flex items-start gap-4">
              <div className="flex-1">
                <div className="text-lg sm:text-xl font-semibold">Why it exists</div>
                <p className="mt-3 text-sm sm:text-base text-gray-800 dark:text-gray-300">
                  This tool was born out of real hosting frustration. Managing multiple properties across different OTAs meant constant stress, endless checking, and painful double bookings. I built a simple dashboard to bring all my bookings together in one place, just to make hosting easier for myself. When other hosts saw it, they asked for it too and that’s how this became a product. It wasn’t built as a business idea, but as a solution we all needed.
                </p>
                <div className="mt-4">
                  <a
                    href="/about"
                    className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl whitespace-nowrap"
                  >
                    🚀 Read the full story
                    <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book demo section */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-6">
          <div className="card-surface overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/15 to-indigo-600/15 p-6 sm:p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold">Want a quick walkthrough?</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Book a demo or jump straight into the instant demo.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a href="/auth/demo-login" className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl btn-shimmer whitespace-nowrap">
                  🚀 Try demo
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
                </a>
                <a href={`mailto:${supportEmail}?subject=${encodeURIComponent("Book for demo")}`} className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px]">
                  📅 Book demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="space-y-6">
        <h2 id="faq" className="text-center text-2xl sm:text-3xl font-semibold">Frequently Asked Questions</h2>
        <FaqSection />
        {/* FAQ schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How fast does sync happen?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sync happens automatically. Some OTAs update within 10 minutes, while others may take up to an hour depending on their refresh cycle."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you support multiple properties?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. You can manage several listings on the same dashboard with ease."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I export iCal back to OTAs?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. You can export your synced iCal feeds to Airbnb, Vrbo, Booking.com and other platforms."
                  }
                },
                {
                  "@type": "Question",
                  "name": "If I block dates here, will it close dates on other platforms?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Any date you block on our calendar will automatically sync across your connected platforms."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What happens if a guest cancels on Airbnb or Vrbo or Other Connected OTA?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The cancelled dates will automatically open up everywhere else once the iCal feed refreshes."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does it work if I change prices or minimum-night rules?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Price and rule changes don’t affect syncing — only booked or blocked dates sync across your calendars."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I sync the same property listed under different names on each platform?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. As long as each listing has its own iCal link, everything will sync correctly even if the listing names are different."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Will cleaning or maintenance blocks sync too?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Any custom blocked date — cleaning, repairs, or personal use — will sync across all connected calendars."
                  }
                }
              ]
            })
          }}
        />
      </section>

      {/* Contact */}
      <section id="contact" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Contact us</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Questions or special requirements? We’re here to help.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email: <a href={`mailto:${supportEmail}`} className="underline hover:text-gray-800 dark:hover:text-gray-200">icalsync.app@gmail.com</a>
          </p>
        </div>
        <div className="mx-auto max-w-3xl px-6">
          <form onSubmit={submitContact} className="card-surface p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 text-sm"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 text-sm"
                placeholder="Tell us what you need"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
              >
                ✉️ Email support
              </a>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl btn-shimmer disabled:opacity-60 whitespace-nowrap"
              >
                {contactSubmitting ? "Sending…" : "Send message"}
                <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Collapsible FAQ component */}
      

      {/* Footer CTA */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-semibold">Stop wasting time on manual updates</h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Connect your listings and let Ical Sync handle the rest.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="/auth/demo-login"
              className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl"
            >
              🚀 Try demo
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqSection() {
  const items = [
    {
      q: "How fast does sync happen?",
      a: "Sync happens automatically. Some OTAs update within 10 minutes, while others may take up to an hour depending on their refresh cycle.",
    },
    {
      q: "Do you support multiple properties?",
      a: "Yes. You can manage several listings on the same dashboard with ease.",
    },
    {
      q: "Can I export iCal back to OTAs?",
      a: "Absolutely. You can export your synced iCal feeds to Airbnb, Vrbo, Booking.com and other platforms.",
    },
    {
      q: "If I block dates here, will it close dates on other platforms?",
      a: "Yes. Any date you block on our calendar will automatically sync across your connected platforms.",
    },
    {
      q: "What happens if a guest cancels on Airbnb or Vrbo or Other Connected OTA?",
      a: "The cancelled dates will automatically open up everywhere else once the iCal feed refreshes.",
    },
    {
      q: "Does it work if I change prices or minimum-night rules?",
      a: "Yes. Price and rule changes don’t affect syncing — only booked or blocked dates sync across your calendars.",
    },
    {
      q: "Can I sync the same property listed under different names on each platform?",
      a: "Yes. As long as each listing has its own iCal link, everything will sync correctly even if the listing names are different.",
    },
    {
      q: "Will cleaning or maintenance blocks sync too?",
      a: "Yes. Any custom blocked date — cleaning, repairs, or personal use — will sync across all connected calendars.",
    },
  ];
  return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {items.map((it) => (
        <FaqItem key={it.q} question={it.q} answer={it.a} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | string>(0);
  const ref = useRef<HTMLDivElement>(null);
  // Measure on open and keep height in sync while expanded
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      const h = el ? el.scrollHeight : 0;
      const styles = el ? getComputedStyle(el) : null;
      const extra = styles ? parseFloat(styles.marginTop || "0") + parseFloat(styles.marginBottom || "0") : 0;
      setMaxHeight(open ? h + extra : 0);
    };
    update();
    if (!open) return;
    window.addEventListener("resize", update);
    let ro: ResizeObserver | null = null;
    if (ref.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(ref.current);
    }
    // In case fonts/layout settle after initial render
    const t = setTimeout(update, 50);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
      clearTimeout(t);
    };
  }, [open]);
  return (
    <div className="card-surface p-4">
      <button
        onClick={() => {
          const el = ref.current;
          const h = el ? el.scrollHeight : 0;
          const styles = el ? getComputedStyle(el) : null;
          const extra = styles ? parseFloat(styles.marginTop || "0") + parseFloat(styles.marginBottom || "0") : 0;
          const measured = h + extra;
          if (!open) {
            setOpen(true);
            setMaxHeight(measured);
          } else {
            setMaxHeight(measured);
            requestAnimationFrame(() => {
              setOpen(false);
              setMaxHeight(0);
            });
          }
        }}
        className="w-full cursor-pointer font-medium flex items-center justify-between text-left"
        aria-expanded={open}
      >
        {question}
        <span className={`text-gray-500 transition-transform ${open ? "rotate-180" : "rotate-0"}`}>▾</span>
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
        style={{ maxHeight, opacity: open ? 1 : 0, willChange: "max-height" }}
      >
        <div ref={ref} className="pt-2 text-sm text-gray-700 dark:text-gray-300">
          {answer}
        </div>
      </div>
    </div>
  );
}

function DashboardSnapshot() {
  const [fallback, setFallback] = useState(false);
  return (
    <div className="relative">
      {!fallback ? (
        <Image
          src="/dashboard-demo.png"
          alt="Unified calendar — demo dashboard"
          width={1200}
          height={560}
          sizes="(min-width: 640px) 66vw, 100vw"
          className="h-36 sm:h-56 w-full object-cover rounded-md border border-neutral-200 dark:border-neutral-800"
          onError={() => setFallback(true)}
          priority={false}
        />
      ) : (
        <div className="h-36 sm:h-56 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 relative overflow-hidden">
          <div className="px-3 pt-2">
            {/* Week header */}
            <div className="grid grid-cols-7 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="text-center">Mon 10</div>
              <div className="text-center">Tue 11</div>
              <div className="text-center">Wed 12</div>
              <div className="text-center">Thu 13</div>
              <div className="text-center">Fri 14</div>
              <div className="text-center">Sat 15</div>
              <div className="text-center">Sun 16</div>
            </div>
            {/* Sample bookings as chips across the grid */}
            <div className="mt-2 grid grid-cols-7 gap-2">
              <div className="col-span-2 bg-blue-600/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Airbnb · John</div>
              <div className="col-start-4 col-span-3 bg-indigo-600/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Booking.com · Sarah</div>
              <div className="col-start-7 col-span-1 bg-emerald-600/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Blocked</div>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              <div className="col-start-1 col-span-1 bg-fuchsia-600/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Vrbo</div>
              <div className="col-start-3 col-span-2 bg-sky-600/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Airbnb</div>
              <div className="col-start-6 col-span-2 bg-amber-500/90 text-white rounded-md px-2 py-1 text-[11px] shadow-sm">Cleaning</div>
            </div>
          </div>
          {/* Soft decorative glow to keep it lively */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_250px_at_20%_10%,rgba(59,130,246,0.06),transparent_60%),radial-gradient(600px_250px_at_80%_10%,rgba(99,102,241,0.06),transparent_60%)]" aria-hidden />
          {/* Preview hint */}
          <div className="absolute bottom-2 left-3 right-3 text-[11px] text-gray-600 dark:text-gray-400 hidden sm:flex items-center gap-1">
            <span aria-hidden>⚡</span>
            <span>Preview only — click to open the live demo</span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-black/5 dark:ring-white/10" aria-hidden />
    </div>
  );
}
  // Landing-only: extra feature bullets to make pricing clearer
  const extraPricingFeatures: Record<"basic" | "super_host" | "custom", string> = {
    basic: "Cancel anytime",
    super_host: "Faster sync and alerts",
    custom: "Dedicated onboarding",
  };
