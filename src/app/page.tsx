import Image from "next/image";
import { plansCatalog, SUPER_HOST_LIMIT } from "@/lib/plans";

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden card-surface">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-inset ring-blue-500/30 dark:from-blue-400/10 dark:to-indigo-400/10 flex items-center justify-center mb-6">
            <span className="text-2xl" aria-hidden>🗓️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Effortless iCal sync across Airbnb, Booking.com, and more
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Stop double‑bookings and manual updates. Connect calendars, auto‑block dates, and keep availability perfectly in sync.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/auth/demo-login"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-white text-sm font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              🚀 Try demo
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              See pricing
            </a>
            <span className="basis-full text-xs text-gray-600 dark:text-gray-400 mt-2">No signup needed • Instant demo</span>
          </div>
        </div>
      </section>

      {/* Trust avatars */}
      <section aria-labelledby="trust-logos" className="text-center">
        <h2 id="trust-logos" className="sr-only">Trusted by hosts</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by hosts syncing calendars every day</p>
        <div className="mt-4 flex justify-center">
          <div className="flex -space-x-3 items-center">
            <img src="https://i.pravatar.cc/80?img=12" alt="Host avatar" loading="lazy" className="inline-block h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=28" alt="Host avatar" loading="lazy" className="inline-block h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=45" alt="Host avatar" loading="lazy" className="inline-block h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=66" alt="Host avatar" loading="lazy" className="inline-block h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <img src="https://i.pravatar.cc/80?img=3" alt="Host avatar" loading="lazy" className="inline-block h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900" />
            <span className="inline-flex items-center h-10 rounded-full bg-neutral-900 text-white text-xs px-3 ring-2 ring-white dark:ring-neutral-900">+89 hosts</span>
          </div>
        </div>
      </section>

      {/* Benefits marquee */}
      <section aria-label="Benefits" className="card-surface py-3 overflow-hidden">
        <div className="marquee">
          <div className="marquee-track">
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✨</span>No double bookings</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>⚡</span>2‑minute setup</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🔒</span>Your data stays private</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🛎️</span>Instant alerts</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>📅</span>Unified calendar view</span>
            {/* duplicate for seamless scroll */}
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>✨</span>No double bookings</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>⚡</span>2‑minute setup</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🔒</span>Your data stays private</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>🛎️</span>Instant alerts</span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><span aria-hidden>📅</span>Unified calendar view</span>
          </div>
        </div>
      </section>

      {/* Supported OTAs */}
      <section aria-labelledby="supported-otas" className="text-center">
        <h2 id="supported-otas" className="sr-only">Supported OTAs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Works with Airbnb, Booking.com, Vrbo, and other OTAs</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Airbnb</span>
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Booking.com</span>
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Vrbo</span>
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Expedia</span>
          <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-sm">Tripadvisor</span>
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
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Keep Airbnb and Booking.com availability perfectly aligned in near real‑time.</p>
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

      {/* How it works */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">How it works</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Three simple steps to perfect availability.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>①</div>
            <h3 className="mt-3 font-semibold">Connect calendars</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Paste Airbnb and Booking.com iCal URLs to link your listings.</p>
          </div>
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>②</div>
            <h3 className="mt-3 font-semibold">Unify and auto‑block</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">View every reservation in one place. New bookings auto‑block dates elsewhere.</p>
          </div>
          <div className="card-surface p-6">
            <div className="text-2xl" aria-hidden>③</div>
            <h3 className="mt-3 font-semibold">Export everywhere</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Export iCal feeds back to OTAs to keep everything perfectly synchronized.</p>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 z-50 flex justify-center">
        <a
          href="/auth/demo-login"
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-sm font-semibold shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          🚀 Try demo
        </a>
      </div>

      {/* Pricing */}
      <section id="pricing" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Fair pricing for every host</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Transparent pricing. Upgrade anytime.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plansCatalog.filter((p) => p.id !== 'business').map((p) => (
            <div key={p.id} className="card-surface p-6 flex flex-col">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{p.propertyLimitLabel}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold">{p.price}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-300">
                {p.features.map((f) => (<li key={f}>• {f}</li>))}
              </ul>
              <a href="/login" className={`mt-6 inline-flex w-full items-center justify-center rounded-md ${p.id === 'basic' ? 'border border-neutral-200 dark:border-neutral-800' : 'bg-blue-600 text-white'} px-4 py-2 text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600/90 transition-colors`}>
                {p.cta}
              </a>
            </div>
          ))}
          {/* Custom */}
          <div className="card-surface p-6 flex flex-col">
            <h3 className="text-lg font-semibold">Custom</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">Tell us what you need</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-bold">Contact</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-300">
              <li>• More than {SUPER_HOST_LIMIT} properties</li>
              <li>• Dedicated support</li>
              <li>• Integrations</li>
            </ul>
            <a href="/dashboard/settings" className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-semibold">Stop wasting time on manual updates</h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Connect your listings and let Ical Sync handle the rest.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="/auth/demo-login"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-white text-sm font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              🚀 Try demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
