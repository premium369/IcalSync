"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarEvent } from "@/types/events";
import Spinner from "@/components/Spinner";

 type PropertyItem = { id: string; name: string };

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "manual" | "ics">("all");
  const calendarRef = useRef<FullCalendar | null>(null);

  const fetchEvents = async (propertyId?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (propertyId) params.set("propertyId", propertyId);
      const qs = params.toString();
      const res = await fetch(`/api/events${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      const data = await res.json();
      setEvents(data);
      setLastSyncedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  // Load properties for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/properties", { cache: "no-store" });
        if (!res.ok) return; // user might be unauthenticated here
        const json = await res.json();
        const items: PropertyItem[] = (json.data || []).map((p: any) => ({ id: p.id, name: p.name }));
        setProperties(items);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Initialize selected property from localStorage once properties are loaded
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.get("propertyId")) return; // URL param takes precedence
      }
      const saved = typeof window !== "undefined" ? localStorage.getItem("calendar:selectedPropertyId") : null;
      const valid = saved && properties.some((p) => p.id === saved) ? saved : null;
      setSelectedPropertyId(valid);
    } catch {
      setSelectedPropertyId(null);
    }
    // Run only when properties list changes (after initial fetch)
  }, [properties]);

  // Apply URL params for deep links on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const focus = url.searchParams.get("focus"); // today
    const v = url.searchParams.get("view") as "dayGridMonth" | "timeGridWeek" | null;
    const pid = url.searchParams.get("propertyId");
    const t = url.searchParams.get("type") as "manual" | "ics" | null;

    if (v && (v === "dayGridMonth" || v === "timeGridWeek")) {
      setView(v);
      const api: any = calendarRef.current?.getApi();
      api?.changeView(v);
    }
    if (focus === "today") {
      const api: any = calendarRef.current?.getApi();
      api?.today();
    }
    if (pid) {
      setSelectedPropertyId(pid);
      try { localStorage.setItem("calendar:selectedPropertyId", pid); } catch {}
    }
    if (t === "manual" || t === "ics") setTypeFilter(t);
  }, []);

  // Refetch events whenever selectedPropertyId changes, and set up periodic refresh
  useEffect(() => {
    fetchEvents(selectedPropertyId);
    const interval = setInterval(() => {
      fetchEvents(selectedPropertyId);
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, [selectedPropertyId]);

  const overlaps = (aStart: Date, aEnd: Date | null, bStart: Date, bEnd: Date | null) => {
    const aS = aStart.getTime();
    const aE = (aEnd ?? aStart).getTime();
    const bS = bStart.getTime();
    const bE = (bEnd ?? bStart).getTime();
    return aS < bE && bS < aE;
  };
  
  const handleDateSelect = async (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    const start = selectInfo.start as Date;
    const end = selectInfo.end as Date | null;

    // Require property selection for manual blocks
    if (!selectedPropertyId) {
      alert("Please select a property first to block dates for.");
      calendarApi.unselect();
      return;
    }

    // prevent creating manual blocks overlapping ICS events
    const hasIcsOverlap = events.some((ev) => {
      // @ts-ignore
      const src = ev.extendedProps?.source;
      if (src !== "ics") return false;
      const evStart = new Date(ev.start);
      const evEnd = ev.end ? new Date(ev.end) : null;
      return overlaps(start, end, evStart, evEnd);
    });
    if (hasIcsOverlap) {
      alert("Selected range overlaps imported OTA bookings. You can’t block over an existing OTA booking.");
      calendarApi.unselect();
      return;
    }

    const isBlocking = confirm("Block selected date range?");
    calendarApi.unselect();
    if (!isBlocking) return;

    const payload = {
      title: "Blocked",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      propertyId: selectedPropertyId,
    } as any;

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) fetchEvents(selectedPropertyId);
  };

  const handleEventChange = async (changeInfo: any) => {
    const ev = changeInfo.event;
    const isIcs = ev.extendedProps?.source === "ics";
    if (isIcs) {
      changeInfo.revert();
      return;
    }
    const payload = {
      title: ev.title,
      start: ev.start?.toISOString(),
      end: ev.end?.toISOString(),
      allDay: ev.allDay,
    };
    const res = await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) await fetchEvents(selectedPropertyId);
  };

  const handleEventClick = async (clickInfo: any) => {
    const ev = clickInfo.event;
    const isIcs = ev.extendedProps?.source === "ics";
    if (isIcs) return;
    if (confirm(`Unblock/delete event '${ev.title}'?`)) {
      const res = await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
      if (res.ok) fetchEvents(selectedPropertyId);
    }
  };

  const onToggleView = () => {
    const next = view === "dayGridMonth" ? "timeGridWeek" : "dayGridMonth";
    setView(next);
    const api: any = calendarRef.current?.getApi();
    if (api) api.changeView(next);
  };

  const onChangeProperty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    const val = raw === "" ? null : raw;
    setSelectedPropertyId(val);
    try {
      if (val) localStorage.setItem("calendar:selectedPropertyId", val);
      else localStorage.removeItem("calendar:selectedPropertyId");
    } catch {
      // ignore
    }
  };

  const filteredEvents = useMemo(() => {
    if (typeFilter === "all") return events;
    return events.filter((ev: any) => (ev?.extendedProps?.source ?? "manual") === typeFilter);
  }, [events, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Imported bookings from your property iCals, plus your manual blocks.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Property dropdown */}
          <label className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block" htmlFor="propertySelect">Property:</label>
          <select
            id="propertySelect"
            className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPropertyId ?? ""}
            onChange={onChangeProperty}
          >
            <option value="">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <label className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block" htmlFor="typeFilter">Type:</label>
          <select
            id="typeFilter"
            className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="ics">Bookings (iCal)</option>
            <option value="manual">Manual blocks</option>
          </select>

          <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 mr-2">{lastSyncedAt ? `Last sync: ${new Date(lastSyncedAt).toLocaleTimeString()}` : ""}</span>
          <button
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
            onClick={() => fetchEvents(selectedPropertyId)}
            disabled={loading}
            title="Refresh events"
          >
            {loading ? (<><Spinner className="h-4 w-4" /> <span>Refreshing</span></>) : "Refresh"}
          </button>
          <button
            className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => calendarRef.current?.getApi().today()}
          >
            Today
          </button>
          <button
            className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm hover:bg-black transition-colors"
            onClick={onToggleView}
          >
            {view === "dayGridMonth" ? "Weekly" : "Monthly"}
          </button>
        </div>
      </div>
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900 shadow-sm">
        <FullCalendar
          ref={calendarRef as any}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ left: "prev,next", center: "title", right: "" }}
          initialView="dayGridMonth"
          selectable
          selectMirror
          editable
          eventStartEditable
          eventDurationEditable
          select={handleDateSelect}
          eventChange={handleEventChange}
          eventClick={handleEventClick}
          events={filteredEvents}
          height="auto"
          dayMaxEventRows={3}
          displayEventTime={false}
          eventContent={(arg) => {
            const bg = (arg.event as any).backgroundColor || (arg.event.extendedProps as any)?.color || arg.backgroundColor;
            const text = arg.timeText ? `${arg.timeText} ${arg.event.title}` : arg.event.title;
            const el = document.createElement("div");
            el.className = "truncate text-[12px] leading-5 transition-[filter]";
            el.style.cssText = `background:${bg || "#e5e7eb"}; color:white; padding:3px 8px; border-radius:9px;`;
            el.innerText = text;
            el.onmouseenter = () => (el.style.filter = "brightness(0.9)");
            el.onmouseleave = () => (el.style.filter = "");
            return { domNodes: [el] } as any;
          }}
          dayHeaderClassNames={() => ["text-gray-500 dark:text-gray-400 text-[11px] font-medium"]}
          dayCellClassNames={() => ["hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"]}
          weekends={true}
        />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#00A699" }}></i>Airbnb</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#003580" }}></i>Booking</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#1A73E8" }}></i>Vrbo</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#F68B1E" }}></i>Expedia</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm" style={{ background: "#6B7280" }}></i>Manual</span>
      </div>
    </div>
  );
}