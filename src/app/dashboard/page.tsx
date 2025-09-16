"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [bookingsToday, setBookingsToday] = useState(0);
  const [manualBlocksToday, setManualBlocksToday] = useState(0);
  const [propertiesAffectedToday, setPropertiesAffectedToday] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sparkline, setSparkline] = useState<number[]>([]); // last 7 days total events
  const [bookingsDelta, setBookingsDelta] = useState<number>(0);
  const [manualDelta, setManualDelta] = useState<number>(0);
  const [affectedDelta, setAffectedDelta] = useState<number>(0);

  const todayRange = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    return { start, end };
  }, []);

  const overlaps = (aS: Date, aE: Date | null, bS: Date, bE: Date | null) => aS.getTime() < (bE??bS).getTime() && bS.getTime() < (aE??aS).getTime();

  async function fetchStats() {
    setLoading(true);
    try {
      const [pr, er] = await Promise.all([
        fetch("/api/properties", { cache: "no-store" }),
        fetch("/api/events", { cache: "no-store" }),
      ]);

      if (pr.ok) {
        const pj = await pr.json();
        setPropertiesCount((pj.data || []).length);
      }
      const events = er.ok ? await er.json() : [];

      let icsToday = 0; let manualToday = 0; const affectedToday = new Set<string>();
      for (const ev of events as any[]) {
        const s = new Date(ev.start);
        const e = ev.end ? new Date(ev.end) : null;
        const src = ev?.extendedProps?.source as string | undefined;
        const pid = ev?.extendedProps?.propertyId as string | null | undefined;
        if (overlaps(todayRange.start, todayRange.end, s, e)) {
          if (src === "ics") icsToday++;
          else manualToday++;
          if (pid) affectedToday.add(pid);
        }
      }

      // compute 7-day counts and yesterday sets
      const countsTotal: number[] = [];
      const countsIcs: number[] = [];
      const countsManual: number[] = [];
      let yesterdayAffected = new Set<string>();
      for (let i = 6; i >= 0; i--) {
        const dStart = new Date(); dStart.setHours(0,0,0,0); dStart.setDate(dStart.getDate() - i);
        const dEnd = new Date(dStart); dEnd.setDate(dEnd.getDate() + 1);
        let c = 0, ci = 0, cm = 0;
        const aff = new Set<string>();
        for (const ev of events as any[]) {
          const s = new Date(ev.start);
          const e = ev.end ? new Date(ev.end) : null;
          if (overlaps(dStart, dEnd, s, e)) {
            c++;
            const src = ev?.extendedProps?.source as string | undefined;
            if (src === "ics") ci++; else cm++;
            const pid = ev?.extendedProps?.propertyId as string | null | undefined;
            if (pid) aff.add(pid);
          }
        }
        countsTotal.push(c);
        countsIcs.push(ci);
        countsManual.push(cm);
        if (i === 1) yesterdayAffected = aff; // when iterating, i=1 corresponds to yesterday bucket
      }

      setBookingsToday(icsToday);
      setManualBlocksToday(manualToday);
      setPropertiesAffectedToday(affectedToday.size);

      setSparkline(countsTotal);
      // deltas vs yesterday
      const todayIdx = 6, yIdx = 5;
      setBookingsDelta((countsIcs[todayIdx] ?? 0) - (countsIcs[yIdx] ?? 0));
      setManualDelta((countsManual[todayIdx] ?? 0) - (countsManual[yIdx] ?? 0));
      setAffectedDelta(affectedToday.size - (yesterdayAffected.size ?? 0));

      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5 * 60 * 1000); // auto-refresh every 5 min
    return () => clearInterval(id);
  }, []);

  const DeltaChip = ({ value }: { value: number }) => {
    const sign = value > 0 ? "+" : value < 0 ? "" : "±";
    const color = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-500";
    return <span className={`text-xs ${color}`}>{sign}{value === 0 ? 0 : value} vs yesterday</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Welcome! This is your home overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">{lastUpdated ? `Updated ${lastUpdated}` : (loading ? "Updating…" : "")}</span>
          <button onClick={fetchStats} className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/properties" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Properties</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-semibold">{loading ? "—" : propertiesCount}</div>
            <span className="text-xl" aria-hidden>🏠</span>
          </div>
        </Link>

        <Link href="/calendar?focus=today" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Bookings today</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-semibold">{loading ? "—" : bookingsToday}</div>
            <span className="text-xl" aria-hidden>📅</span>
          </div>
          <div className="mt-1"><DeltaChip value={bookingsDelta} /></div>
          {/* sparkline */}
          <div className="mt-3 h-8 flex items-end gap-1" aria-hidden>
            {sparkline.map((v, i) => (
              <div key={i} className="w-2 bg-blue-500/70 rounded-sm" style={{ height: `${Math.max(2, Math.min(100, v * 8))}%` }} />
            ))}
          </div>
        </Link>

        <Link href="/calendar?focus=today&type=manual" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Manual blocks today</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-semibold">{loading ? "—" : manualBlocksToday}</div>
            <span className="text-xl" aria-hidden>⛔</span>
          </div>
          <div className="mt-1"><DeltaChip value={manualDelta} /></div>
        </Link>

        <Link href="/calendar?focus=today" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Properties affected today</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-semibold">{loading ? "—" : propertiesAffectedToday}</div>
            <span className="text-xl" aria-hidden>🏷️</span>
          </div>
          <div className="mt-1"><DeltaChip value={affectedDelta} /></div>
        </Link>
      </div>
    </div>
  );
}