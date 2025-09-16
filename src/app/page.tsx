import Image from "next/image";

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
            <span className="text-2xl">🗓️</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Sync your Airbnb & Booking.com calendars automatically
          </h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            Avoid double-bookings and manual updates. Connect your listings and let
            Ical Sync keep your availability in perfect sync across platforms.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-white text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Get started free
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              See features
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Everything you need to stay in sync</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Simple setup, powerful results.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">🔁</div>
            <h3 className="mt-3 font-semibold">Calendar sync</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Two-way iCal sync with Airbnb and Booking.com to keep availability updated in real time.
            </p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">🏘️</div>
            <h3 className="mt-3 font-semibold">Multiple properties</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Manage all your listings from one dashboard. Perfect for hosts with more than one property.
            </p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">⛔</div>
            <h3 className="mt-3 font-semibold">Auto‑block dates</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              When a booking comes in on one platform, the dates are automatically blocked everywhere else.
            </p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">📥</div>
            <h3 className="mt-3 font-semibold">Easy iCal import</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Paste your Airbnb or Booking.com iCal URLs and you’re connected in seconds—no complex setup.
            </p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">🗂️</div>
            <h3 className="mt-3 font-semibold">Unified calendar view</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              See all properties and reservations in one clean view so you can spot gaps and overlaps quickly.
            </p>
          </div>
          <div className="group card-surface p-6 transition-shadow hover:shadow-md">
            <div className="text-2xl">🔔</div>
            <h3 className="mt-3 font-semibold">Booking alerts</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Get notified about new bookings or potential conflicts so you can act right away.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Fair pricing for every host</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Start free and scale as your business grows.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">For getting started</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-300">
              <li>• 1 property</li>
              <li>• Calendar sync</li>
              <li>• Auto-block dates</li>
            </ul>
            <a href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              Get started
            </a>
          </div>

          {/* Starter */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold">Starter</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">For growing hosts</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-bold">$9</span>
              <span className="text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-300">
              <li>• Up to 5 properties</li>
              <li>• Priority sync</li>
              <li>• Email support</li>
            </ul>
            <a href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Choose Starter
            </a>
          </div>

          {/* Pro */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">For serious operators</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-bold">$19</span>
              <span className="text-gray-500 dark:text-gray-400">/mo</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-300">
              <li>• Unlimited properties</li>
              <li>• Fastest sync</li>
              <li>• Priority support</li>
            </ul>
            <a href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Choose Pro
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-semibold">Stop wasting time on manual updates</h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Connect your listings and let Ical Sync handle the rest.</p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create your free account
          </a>
        </div>
      </section>
    </div>
  );
}
