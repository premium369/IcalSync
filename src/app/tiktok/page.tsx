export default function TiktokLanding() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">Hi TikTok 👋</h1>
      <p className="text-sm text-gray-700 dark:text-gray-300">Let’s sync your calendars and stop double bookings. Start by requesting an upgrade.</p>
      <a href="/dashboard/settings" className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700">Request upgrade</a>
    </div>
  );
}