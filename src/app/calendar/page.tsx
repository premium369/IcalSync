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
  const [lastNotesCount, setLastNotesCount] = useState<number>(0);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "manual" | "ics" | "notes">("all");
  const calendarRef = useRef<FullCalendar | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Selection modal state for choosing block vs note
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selectionAction, setSelectionAction] = useState<"block" | "note">("block");
  const [selectionNoteText, setSelectionNoteText] = useState("");
  const [selectionStartStr, setSelectionStartStr] = useState<string>("");
  const [selectionEndStr, setSelectionEndStr] = useState<string>("");
  const [selectionAllDay, setSelectionAllDay] = useState<boolean>(true);
  const [selectionSaving, setSelectionSaving] = useState<boolean>(false);

  const fetchEvents = async (propertyId?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (propertyId) params.set("propertyId", propertyId);
      const qs = params.toString();
      const res = await fetch(`/api/events${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      let data: any[] = [];
      if (res.ok) {
        try { data = await res.json(); setEventsError(null); } catch { data = []; setEventsError("Failed to parse events"); }
      } else {
        try { const j = await res.json(); setEventsError(j?.error || "Failed to load events"); } catch { setEventsError("Failed to load events"); }
      }

      // Fetch property notes and map to calendar events
      const nr = await fetch(`/api/notes${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      let notes: any[] = [];
      if (nr.ok) {
        try { notes = await nr.json(); setNotesError(null); } catch { notes = []; setNotesError("Failed to parse notes"); }
      } else {
        try { const j = await nr.json(); setNotesError(j?.error || "Failed to load notes"); } catch { setNotesError("Failed to load notes"); }
      }
      const noteEvents = (notes || []).map((n: any) => ({
        id: n.id,
        title: `📝 ${n.text}`,
        start: n.note_date, // YYYY-MM-DD
        end: undefined,
        allDay: true,
        color: "#F59E0B", // amber
        extendedProps: { source: "note", propertyId: n.property_id, noteText: n.text },
      }));

      // Prioritize notes so they appear first in day cells
      setEvents([...(noteEvents || []), ...(data || [])]);
      setLastSyncedAt(new Date().toISOString());
      setLastNotesCount((notes || []).length);
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by rendering certain dynamic values only after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

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
    const t = url.searchParams.get("type") as "manual" | "ics" | "notes" | null;

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
    if (t === "manual" || t === "ics" || t === "notes") setTypeFilter(t);
  }, []);

  // Refetch events whenever selectedPropertyId changes, and set up periodic refresh
  useEffect(() => {
    fetchEvents(selectedPropertyId);
    const interval = setInterval(() => {
      fetchEvents(selectedPropertyId);
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, [selectedPropertyId]);

  const startOfDay = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };
  // Overlap check that respects all-day exclusive end semantics
  const overlaps = (
    aStart: Date,
    aEnd: Date | null,
    aAllDay: boolean,
    bStart: Date,
    bEnd: Date | null,
    bAllDay: boolean
  ) => {
    const aS = (aAllDay ? startOfDay(aStart) : aStart).getTime();
    const aE = (aAllDay ? startOfDay(aEnd ?? aStart) : (aEnd ?? aStart)).getTime();
    const bS = (bAllDay ? startOfDay(bStart) : bStart).getTime();
    const bE = (bAllDay ? startOfDay(bEnd ?? bStart) : (bEnd ?? bStart)).getTime();
    // With exclusive end for all-day, adjacent ranges (e.g., 8th vs 9th) should NOT overlap
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
    const isAllDaySelection = !!selectInfo.allDay;
    const hasIcsOverlap = events.some((ev) => {
      // @ts-ignore
      const src = ev.extendedProps?.source;
      if (src !== "ics") return false;
      const evStart = new Date(ev.start);
      const evEnd = ev.end ? new Date(ev.end) : null;
      const evAllDay = !!(ev as any).allDay;
      return overlaps(start, end, isAllDaySelection, evStart, evEnd, evAllDay);
    });
    if (hasIcsOverlap) {
      alert("Selected range overlaps imported OTA bookings. You can’t block over an existing OTA booking.");
      calendarApi.unselect();
      return;
    }

    // Open modal to choose block vs note and optionally enter note
    setSelectionStartStr(selectInfo.startStr);
    setSelectionEndStr(selectInfo.endStr);
    setSelectionAllDay(!!selectInfo.allDay);
    setSelectionAction("block");
    setSelectionNoteText("");
    setSelectionOpen(true);
  };

  const handleEventChange = async (changeInfo: any) => {
    const ev = changeInfo.event;
    const src = ev.extendedProps?.source;
    const isIcs = src === "ics";
    const isNote = src === "note";
    if (isIcs || isNote) {
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

  // Enable tap-to-select on mobile: single-day selection via date click
  const handleDateClick = (arg: any) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!selectedPropertyId) {
      alert("Please select a property first to block dates for.");
      calendarApi?.unselect();
      return;
    }
    // Prepare selection modal with a single all-day day
    const startIso = arg.date instanceof Date ? arg.date.toISOString() : new Date(arg.date).toISOString();
    const nextDay = new Date(new Date(startIso).getTime() + 24 * 60 * 60 * 1000);
    const endIso = nextDay.toISOString();
    setSelectionStartStr(startIso);
    setSelectionEndStr(endIso);
    setSelectionAllDay(true);
    setSelectionAction("block");
    setSelectionNoteText("");
    setSelectionOpen(true);
  };

  const handleEventClick = async (clickInfo: any) => {
    const ev = clickInfo.event;
    const src = ev.extendedProps?.source;
    const isIcs = src === "ics";
    const isNote = src === "note";
    if (isIcs) return;
    if (isNote) {
      const current = ev.extendedProps?.noteText as string | undefined;
      const next = prompt("Edit note (leave empty to delete):", current || "");
      if (next === null) return; // cancel
      if (!next) {
        const del = await fetch(`/api/notes/${ev.id}`, { method: "DELETE" });
        if (del.ok) fetchEvents(selectedPropertyId);
      } else {
        const upd = await fetch(`/api/notes/${ev.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: next }),
        });
        if (upd.ok) fetchEvents(selectedPropertyId);
      }
      return;
    }
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
    if (typeFilter === "manual") {
      // Show user-created items (manual blocks and notes)
      return events.filter((ev: any) => (ev?.extendedProps?.source ?? "manual") !== "ics");
    }
    if (typeFilter === "notes") {
      return events.filter((ev: any) => (ev?.extendedProps?.source ?? "manual") === "note");
    }
    // Bookings (iCal) only
    return events.filter((ev: any) => (ev?.extendedProps?.source ?? "manual") === "ics");
  }, [events, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Selection modal for block vs note */}
      {selectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectionOpen(false)}></div>
          <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl">
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">Choose an action</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectionAllDay ? "Selected date range" : "Selected time range"}: {new Date(selectionStartStr).toLocaleString()} {selectionEndStr ? `→ ${new Date(selectionEndStr).toLocaleString()}` : ""}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  className={`px-3 py-2 rounded-md border text-sm ${selectionAction === "block" ? "bg-gray-900 text-white" : "border-neutral-200 dark:border-neutral-800"}`}
                  onClick={() => setSelectionAction("block")}
                >
                  Block dates
                </button>
                <button
                  className={`px-3 py-2 rounded-md border text-sm ${selectionAction === "note" ? "bg-amber-500 text-white" : "border-neutral-200 dark:border-neutral-800"}`}
                  onClick={() => setSelectionAction("note")}
                >
                  Add note
                </button>
              </div>
              {selectionAction === "note" && (
                <div className="mt-3 space-y-1">
                  <label className="text-sm font-medium">Note (per-day)</label>
                  <textarea
                    className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={selectionNoteText}
                    onChange={(e) => setSelectionNoteText(e.target.value)}
                    placeholder="e.g. Guest request, maintenance, pricing note"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notes attach to the start date only for the selected property.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800">
              <button className="px-3 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm active:scale-95 transition-transform" onClick={() => setSelectionOpen(false)}>Cancel</button>
              <button
                className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                onClick={async () => {
                  if (selectionSaving) return;
                  setSelectionSaving(true);
                  const propertyId = selectedPropertyId;
                  if (!propertyId) { setSelectionOpen(false); return; }
                  if (selectionAction === "block") {
                    const payload = {
                      title: "Blocked",
                      start: selectionAllDay ? selectionStartStr.substring(0, 10) : selectionStartStr,
                      end: selectionAllDay ? (selectionEndStr ? selectionEndStr.substring(0, 10) : undefined) : selectionEndStr,
                      allDay: selectionAllDay,
                      propertyId,
                    } as any;
                    const res = await fetch("/api/events", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    setSelectionOpen(false);
                    if (res.ok) fetchEvents(selectedPropertyId);
                    try { calendarRef.current?.getApi().unselect(); } catch {}
                  } else {
                    const dateOnly = selectionStartStr.substring(0, 10);
                    if (!selectionNoteText.trim()) return;
                    const res = await fetch("/api/notes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ propertyId, date: dateOnly, text: selectionNoteText.trim() }),
                    });
                    setSelectionOpen(false);
                    if (res.ok) fetchEvents(selectedPropertyId);
                    try { calendarRef.current?.getApi().unselect(); } catch {}
                  }
                  setSelectionSaving(false);
                }}
                disabled={selectionSaving || (selectionAction === "note" && !selectionNoteText.trim())}
              >
                {selectionSaving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">Imported bookings, your manual blocks, and per-day property notes.</p>
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
            <option value="notes">Notes only</option>
          </select>

          {hasMounted && lastSyncedAt ? (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 mr-2">{`Last sync: ${new Date(lastSyncedAt).toLocaleTimeString()}`}</span>
          ) : null}
          {hasMounted ? (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 mr-2">{`Notes: ${lastNotesCount}`}</span>
          ) : null}
          {hasMounted && typeFilter === "notes" ? (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 mr-2">{`Showing ${filteredEvents.filter((e: any) => (e?.extendedProps?.source ?? "manual") === "note").length} notes`}</span>
          ) : null}
          {hasMounted && (notesError || eventsError) ? (
            <span className="inline text-xs mr-2 px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">{notesError || eventsError}</span>
          ) : null}
          <button
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => fetchEvents(selectedPropertyId)}
            disabled={loading}
            title="Refresh events"
          >
            {loading ? (<><Spinner className="h-4 w-4" /> <span>Refreshing</span></>) : "Refresh"}
          </button>
          <button
            className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors active:scale-95 transition-transform"
            onClick={() => calendarRef.current?.getApi().today()}
          >
            Today
          </button>
          <button
            className="px-3 py-1 rounded-md bg-gray-900 text-white text-sm hover:bg-black transition-colors active:scale-95 transition-transform"
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
          timeZone="UTC"
          selectable
          selectMirror
          selectLongPressDelay={250}
          editable
          eventStartEditable
          eventDurationEditable
          select={handleDateSelect}
          dateClick={handleDateClick}
          eventChange={handleEventChange}
          eventClick={handleEventClick}
          events={filteredEvents}
          eventOrder={(a: any, b: any) => {
            const sa = (a.extendedProps?.source ?? "manual") as string;
            const sb = (b.extendedProps?.source ?? "manual") as string;
            const rank = (s: string) => (s === "note" ? 0 : s === "manual" ? 1 : s === "ics" ? 2 : 3);
            return rank(sa) - rank(sb);
          }}
          height="auto"
          dayMaxEventRows={5}
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