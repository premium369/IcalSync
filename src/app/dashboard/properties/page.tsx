"use client";

import { useEffect, useMemo, useState } from "react";

type ICalItem = { id?: string; url: string };
type PropertyItem = { id: string; name: string; created_at?: string; icalUrls: ICalItem[]; icalToken?: string };

type ApiListResponse = { data?: PropertyItem[]; error?: string };
type ApiOneResponse = { data?: PropertyItem; error?: string };

type FormState = {
  name: string;
  icals: string[];
  submitting: boolean;
  error: string | null;
};

function isValidUrl(u: string) {
  try { new URL(u); return true; } catch { return false; }
}

export default function PropertiesPage() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<import("@/types/events").CalendarEvent[]>([]);
  const [occupancyByProperty, setOccupancyByProperty] = useState<Record<string, number>>({});

  const [form, setForm] = useState<FormState>({ name: "", icals: [""], submitting: false, error: null });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcals, setEditIcals] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  async function rotateIcalToken(id: string) {
    try {
      setRotatingId(id);
      const res = await fetch(`/api/properties/${id}/rotate-ical`, { method: "POST" });
      const text = await res.text();
      let json: ApiOneResponse;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text.slice(0, 100) || `Error ${res.status}`);
      }

      if (!res.ok) throw new Error(json.error || "Failed to rotate");
      if (json.data) {
        setItems((prev) => prev.map((p) => (p.id === id ? (json.data as PropertyItem) : p)));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to rotate iCal token";
      alert(msg);
    } finally {
      setRotatingId(null);
    }
  }
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/properties", { cache: "no-store" });
        const json: ApiListResponse = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load");
        if (alive) setItems(json.data || []);
      } catch (e: unknown) {
        if (alive) setLoadError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Fetch events once to compute occupancy per property (last 30 days, ICS only)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        
        const er = await fetch("/api/events", { cache: "no-store" });
        if (!er.ok) { return; }
        const data = await er.json();
        if (alive) setEvents(data || []);
      } finally {
      }
    })();
    return () => { alive = false; };
  }, []);

  // Compute next 30-day occupancy per property from ICS events
  useEffect(() => {
    if (!items.length || !events.length) { setOccupancyByProperty({}); return; }
    const windowDays = 30;
    // Use local midnight boundaries and NEXT 30 days window
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(start.getDate() + windowDays); // exclusive end

    // Precompute daily ranges (local date boundaries)
    const days: { dStart: Date; dEnd: Date; s: string }[] = [];
    const cursor = new Date(start);
    while (cursor < end) {
      const dStart = new Date(cursor);
      const dEnd = new Date(cursor); dEnd.setDate(dEnd.getDate() + 1);
      const s = dStart.toISOString().substring(0, 10);
      days.push({ dStart, dEnd, s });
      cursor.setDate(cursor.getDate() + 1);
    }

    const occupied: Record<string, Set<string>> = {};
    const overlaps = (aS: Date, aE: Date | null, bS: Date, bE: Date) => aS.getTime() < bE.getTime() && bS.getTime() < (aE ?? aS).getTime();
    for (const ev of events) {
      const src = (ev.extendedProps as { source?: string } | undefined)?.source;
      const pid = (ev.extendedProps as { propertyId?: string } | undefined)?.propertyId;
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
    for (const p of items) {
      const set = occupied[p.id] || new Set<string>();
      occ[p.id] = Math.round((set.size / windowDays) * 100);
    }
    setOccupancyByProperty(occ);
  }, [items, events]);

  const canAddMoreIcals = useMemo(() => form.icals.filter(Boolean).length < 5 && form.icals.length < 5, [form.icals]);
  const canAddMoreEditIcals = useMemo(() => editIcals.filter(Boolean).length < 5 && editIcals.length < 5, [editIcals]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setForm((f) => ({ ...f, submitting: true, error: null }));
    const name = form.name.trim();
    const icalUrls = form.icals.map(s => (s || "").trim()).filter(Boolean);

    if (!name) {
      setForm((f) => ({ ...f, submitting: false, error: "Property name is required" }));
      return;
    }
    if (icalUrls.length > 5) {
      setForm((f) => ({ ...f, submitting: false, error: "You can add up to 5 iCal links" }));
      return;
    }
    for (const u of icalUrls) {
      if (!isValidUrl(u)) {
        setForm((f) => ({ ...f, submitting: false, error: `Invalid URL: ${u}` }));
        return;
      }
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icalUrls })
      });
      const json: ApiOneResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");
      if (json.data) setItems((prev) => [json.data!, ...prev]);
      setForm({ name: "", icals: [""], submitting: false, error: null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create";
      setForm((f) => ({ ...f, submitting: false, error: msg }));
    }
  }

  function addIcalField() {
    if (form.icals.length >= 5) return;
    setForm((f) => ({ ...f, icals: [...f.icals, ""] }));
  }
  function removeIcalField(idx: number) {
    setForm((f) => ({ ...f, icals: f.icals.filter((_, i) => i !== idx) }));
  }

  function startEdit(p: PropertyItem) {
    setEditingId(p.id);
    setEditName(p.name);
    const urls = (p.icalUrls || []).map(i => i.url);
    setEditIcals(urls.length ? urls : [""]);
    setEditError(null);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIcals([]);
    setEditError(null);
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    const icalUrls = editIcals.map(s => (s || "").trim()).filter(Boolean);

    if (!name) { setEditError("Property name is required"); return; }
    if (icalUrls.length > 5) { setEditError("You can add up to 5 iCal links"); return; }
    for (const u of icalUrls) { if (!isValidUrl(u)) { setEditError(`Invalid URL: ${u}`); return; } }

    try {
      setEditSaving(true);
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icalUrls })
      });
      const json: ApiOneResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setItems((prev) => prev.map(p => p.id === id ? (json.data as PropertyItem) : p));
      cancelEdit();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      setItems((prev) => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to delete";
      alert(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Add your listings and connect iCal feeds (Airbnb, Booking.com, Vrbo etc.).</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Property name</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Beach House"
            data-tour-id="prop-name-input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">iCal links (up to 5)</label>
            <button type="button" onClick={addIcalField} disabled={!canAddMoreIcals} className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50" data-tour-id="add-ical-btn">Add link</button>
          </div>
          {form.icals.map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="url"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={val}
                onChange={(e) => setForm((f) => ({ ...f, icals: f.icals.map((v, i) => i === idx ? e.target.value : v) }))}
                placeholder="https://..."
                data-tour-id={idx === 0 ? "prop-ical-input" : undefined}
              />
              <button type="button" onClick={() => removeIcalField(idx)} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700">Remove</button>
            </div>
          ))}
        </div>

        {form.error && <p className="text-sm text-red-600">{form.error}</p>}
        <button type="submit" disabled={form.submitting} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50" data-tour-id="prop-add-btn">
          {form.submitting ? "Saving..." : "Add property"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Your properties</h2>
        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No properties yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <div key={p.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
                {editingId === p.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Property name</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium">iCal links (up to 5)</label>
                        <button type="button" onClick={() => setEditIcals((arr) => arr.length < 5 ? [...arr, ""] : arr)} disabled={!canAddMoreEditIcals} className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50">Add link</button>
                      </div>
                      {editIcals.map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="url"
                            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={val}
                            onChange={(e) => setEditIcals((arr) => arr.map((v, i) => i === idx ? e.target.value : v))}
                          />
                          <button type="button" onClick={() => setEditIcals((arr) => arr.filter((_, i) => i !== idx))} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 active:scale-95 transition-transform">Remove</button>
                        </div>
                      ))}
                    </div>
                    {editError && <p className="text-sm text-red-600">{editError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(p.id)} disabled={editSaving} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50 active:scale-95 transition-transform">{editSaving ? "Saving..." : "Save"}</button>
                      <button onClick={cancelEdit} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 active:scale-95 transition-transform">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">{p.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{p.icalUrls?.length || 0} iCal link(s)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Occupancy (30d)</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{Number.isFinite(occupancyByProperty[p.id]) ? `${occupancyByProperty[p.id]}%` : "—"}</div>
                          <div className="h-2 w-20 rounded bg-gray-200 dark:bg-neutral-800 overflow-hidden" aria-hidden>
                            <div className="h-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, occupancyByProperty[p.id] ?? 0))}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                      {p.icalUrls?.length ? (
                        <ul className="text-xs list-disc ml-4 text-gray-700 dark:text-gray-300">
                          {p.icalUrls.map((i) => (
                            <li key={i.id || i.url} className="truncate max-w-xl"><a href={i.url} target="_blank" className="underline hover:no-underline">{i.url}</a></li>
                          ))}
                        </ul>
                      ) : null}
                      {p.icalToken ? (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">Unified iCal export link</div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-full">
                            <input
                              readOnly
                              value={`${origin}/api/ical/${p.icalToken}`}
                              className="w-full sm:flex-1 overflow-hidden text-ellipsis rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                await copyToClipboard(`${origin}/api/ical/${p.icalToken}`);
                                setCopiedId(p.id);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="text-xs px-2 py-1 rounded bg-gray-800 text-white active:scale-95 transition-transform"
                              aria-live="polite"
                            >
                              {copiedId === p.id ? "Copied!" : "Copy"}
                            </button>
                            <button type="button" onClick={() => rotateIcalToken(p.id)} disabled={rotatingId === p.id} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform">{rotatingId === p.id ? "Rotating..." : "Rotate link"}</button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
                            Tip: OTAs like Booking.com and Airbnb usually poll iCal feeds every 30–60 minutes. For immediate updates, use the manual refresh in the OTA’s extranet. This export includes only your manual blocks to avoid duplicate bookings.
                          </p>
                        </div>
                      ) : null}
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 active:scale-95 transition-transform">Edit</button>
                      <button onClick={() => deleteItem(p.id)} className="px-3 py-2 rounded bg-red-600 text-white active:scale-95 transition-transform">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
