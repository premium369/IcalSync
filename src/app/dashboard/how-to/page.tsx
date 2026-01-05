"use client";
import Link from "next/link";

export default function DashboardHowToPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="text-lg font-semibold">How to use your dashboard</div>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>View all bookings from all platforms in one place</li>
          <li>Tap any booking for details</li>
          <li>Block dates directly — it syncs everywhere</li>
          <li>Check alerts for conflicts or new bookings</li>
          <li>Add more properties or calendars from the menu</li>
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <Link href="/dashboard" className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm">Go to Dashboard</Link>
          <a href="https://www.youtube.com/watch?v=XXXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Watch Demo</a>
        </div>
      </div>
    </div>
  );
}