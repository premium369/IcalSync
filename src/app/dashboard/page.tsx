"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookingsToday, setBookingsToday] = useState(0);
  // removed manual blocks / affected cards per request
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [sparkline, setSparkline] = useState<number[]>([]); // last 7 days total events
  const [bookingsDelta, setBookingsDelta] = useState<number>(0);
  // per-property metrics
  const [occupancyByProperty, setOccupancyByProperty] = useState<Record<string, number>>({});
  const [bookedTodayByProperty, setBookedTodayByProperty] = useState<Record<string, boolean>>({});

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

      // Use a local list variable so subsequent calculations can reference it
      let list: any[] = [];
      if (pr.ok) {
        const pj = await pr.json();
        list = pj.data || [];
        setProperties(list);
        setPropertiesCount(list.length);
      } else {
        setProperties([]);
        setPropertiesCount(0);
      }
      const events = er.ok ? await er.json() : [];

      let icsToday = 0;
      // compute per-property today booked (ICS only)
      const bookedToday: Record<string, boolean> = {};
      for (const ev of events as any[]) {
        const s = new Date(ev.start);
        const e = ev.end ? new Date(ev.end) : null;
        const src = ev?.extendedProps?.source as string | undefined;
        const pid = ev?.extendedProps?.propertyId as string | null | undefined;
        if (overlaps(todayRange.start, todayRange.end, s, e)) {
          if (src === "ics") {
            icsToday++;
            if (pid) bookedToday[pid] = true;
          }
        }
      }

      // compute 7-day counts and yesterday sets
      const countsTotal: number[] = [];
      const countsIcs: number[] = [];
      const countsManual: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dStart = new Date(); dStart.setHours(0,0,0,0); dStart.setDate(dStart.getDate() - i);
        const dEnd = new Date(dStart); dEnd.setDate(dEnd.getDate() + 1);
        let c = 0, ci = 0, cm = 0;
        for (const ev of events as any[]) {
          const s = new Date(ev.start);
          const e = ev.end ? new Date(ev.end) : null;
          if (overlaps(dStart, dEnd, s, e)) {
            c++;
            const src = ev?.extendedProps?.source as string | undefined;
            if (src === "ics") ci++; else cm++;
          }
        }
        countsTotal.push(c);
        countsIcs.push(ci);
        countsManual.push(cm);
      }

      setBookingsToday(icsToday);
      setBookedTodayByProperty(bookedToday);

      setSparkline(countsTotal);
      // deltas vs yesterday
      const todayIdx = 6, yIdx = 5;
      setBookingsDelta((countsIcs[todayIdx] ?? 0) - (countsIcs[yIdx] ?? 0));

      // Compute next 30-day occupancy per property (ICS only, local midnight)
      // Use the freshly fetched `list` to avoid stale state during the same tick
      if (list.length) {
        const windowDays = 30;
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(start.getDate() + windowDays);
        const days: { dStart: Date; dEnd: Date; s: string }[] = [];
        let cursor = new Date(start);
        while (cursor < end) {
          const dStart = new Date(cursor);
          const dEnd = new Date(cursor); dEnd.setDate(dEnd.getDate() + 1);
          const sKey = dStart.toISOString().substring(0, 10);
          days.push({ dStart, dEnd, s: sKey });
          cursor.setDate(cursor.getDate() + 1);
        }
        const occupied: Record<string, Set<string>> = {};
        for (const ev of events as any[]) {
          const src = ev?.extendedProps?.source as string | undefined;
          const pid = ev?.extendedProps?.propertyId as string | undefined;
          if (!pid || src !== "ics") continue;
          const s = new Date(ev.start);
          const e = ev.end ? new Date(ev.end) : null;
          for (const d of days) {
            if (overlaps(s, e, d.dStart, d.dEnd)) {
              (occupied[pid] ||= new Set<string>()).add(d.s);
            }
          }
        }
        const occ: Record<string, number> = {};
        for (const p of list) {
          const set = occupied[p.id] || new Set<string>();
          occ[p.id] = Math.round((set.size / windowDays) * 100);
        }
        setOccupancyByProperty(occ);
      }

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
          <button onClick={fetchStats} className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-transform">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/properties" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-transform">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Properties</div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-3xl font-semibold">{loading ? "—" : propertiesCount}</div>
            <span className="text-xl" aria-hidden>🏠</span>
          </div>
        </Link>

        <Link href="/calendar?focus=today" className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-transform">
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

        {/* Properties status card: name, occupancy (next 30d), booked/open today */}
        <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Properties overview</div>
          <div className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">Loading…</div>
            ) : properties.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No properties yet.</div>
            ) : (
              properties.map((p: any) => (
                <div key={p.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Occupancy (30d): {Number.isFinite(occupancyByProperty[p.id]) ? `${occupancyByProperty[p.id]}%` : "—"}</div>
                  </div>
                  <div className="shrink-0">
                    {bookedTodayByProperty[p.id] ? (
                      <span className="inline-flex items-center rounded-md bg-blue-600/15 text-blue-700 dark:text-blue-300 px-2 py-1 text-xs">Booked today</span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-green-600/15 text-green-700 dark:text-green-300 px-2 py-1 text-xs">Open today</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}