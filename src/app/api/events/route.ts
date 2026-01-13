import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
// Cached external events are read from DB (see external_events table)

type EventRow = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  all_day: boolean | null;
  property_id: string | null;
};

const EventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  start: z.string(),
  end: z.string().optional(),
  allDay: z.boolean().optional(),
  propertyId: z.string().uuid().nullish(),
});

const OTA_COLORS: Record<string, string> = {
  airbnb: "#00A699",
  booking: "#003580",
  vrbo: "#1A73E8",
  expedia: "#F68B1E",
  manual: "#6B7280",
};

function isDateOnly(s?: string | null) {
  return !!s && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s);
}
function toMidnightUtcIso(dateOnly: string) {
  // Convert YYYY-MM-DD to midnight UTC ISO
  const y = Number(dateOnly.slice(0, 4));
  const m = Number(dateOnly.slice(5, 7)) - 1;
  const d = Number(dateOnly.slice(8, 10));
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0)).toISOString();
}
function toDateOnly(iso: string) {
  // Take stored timestamptz and present as YYYY-MM-DD in UTC
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return iso; }
}

function detectOta(summary: string | undefined, uid: string | undefined, url?: string) {
  const text = `${summary || ""} ${uid || ""} ${url || ""}`.toLowerCase();
  if (text.includes("airbnb")) return "airbnb";
  if (text.includes("booking")) return "booking";
  if (text.includes("vrbo") || text.includes("homeaway")) return "vrbo";
  if (text.includes("expedia")) return "expedia";
  return undefined;
}

async function readCachedExternalEvents(supabase: any, userId: string, propertyId?: string | null) {
  let q = supabase
    .from("external_events")
    .select("uid, title, start, end, all_day, ota, property_id, feed_url")
    .eq("user_id", userId) as any;
  if (propertyId) q = q.eq("property_id", propertyId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map((e: any) => ({
    id: e.uid,
    title: e.title,
    start: e.start,
    end: e.end ?? undefined,
    allDay: !!e.all_day,
    color: e.ota ? OTA_COLORS[e.ota] : OTA_COLORS["manual"],
    extendedProps: {
      source: "ics",
      ota: e.ota,
      propertyId: e.property_id,
      feedUrl: e.feed_url,
    },
  }));
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 200 });

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");

  // manual events from DB
  let q = supabase
    .from("events")
    .select("id, title, start, end, all_day, property_id")
    .eq("user_id", user.id)
    .order("start") as any;
  if (propertyId) q = q.eq("property_id", propertyId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as EventRow[];
  const manualEvents = rows.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.all_day ? toDateOnly(e.start) : e.start,
    end: e.all_day ? (e.end ? toDateOnly(e.end) : undefined) : (e.end ?? undefined),
    allDay: e.all_day ?? undefined,
    color: OTA_COLORS["manual"],
    extendedProps: { source: "manual", propertyId: e.property_id ?? null },
  }));

  // cached external ics events (best-effort from scheduled sync)
  let icsEvents: any[] = [];
  try {
    icsEvents = await readCachedExternalEvents(supabase, user.id, propertyId);
  } catch (_e) {
    // ignore
  }

  return NextResponse.json([...manualEvents, ...icsEvents]);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = parsed.data;
  // Normalize all-day date-only inputs to midnight UTC
  const startValue = payload.allDay && isDateOnly(payload.start)
    ? toMidnightUtcIso(payload.start)
    : payload.start;
  const endValue = payload.allDay && isDateOnly(payload.end || undefined)
    ? toMidnightUtcIso(payload.end as string)
    : (payload.end ?? null);
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: payload.title,
      start: startValue,
      end: endValue,
      all_day: payload.allDay ?? null,
      property_id: payload.propertyId ?? null,
    })
    .select("id, title, start, end, all_day, property_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id: data.id,
    title: data.title,
    start: data.all_day ? toDateOnly(data.start) : data.start,
    end: data.all_day ? (data.end ? toDateOnly(data.end) : undefined) : (data.end ?? undefined),
    allDay: data.all_day ?? undefined,
    color: OTA_COLORS["manual"],
    extendedProps: { source: "manual", propertyId: data.property_id ?? null },
  });
}
