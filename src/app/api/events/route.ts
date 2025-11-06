import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";
import ical from "node-ical";

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

function detectOta(summary: string | undefined, uid: string | undefined, url?: string) {
  const text = `${summary || ""} ${uid || ""} ${url || ""}`.toLowerCase();
  if (text.includes("airbnb")) return "airbnb";
  if (text.includes("booking")) return "booking";
  if (text.includes("vrbo") || text.includes("homeaway")) return "vrbo";
  if (text.includes("expedia")) return "expedia";
  return undefined;
}

async function fetchIcsEventsForUser(supabase: any, userId: string, propertyId?: string | null) {
  // get properties and their icals for user (optionally one property)
  let query = supabase
    .from("properties")
    .select("id, name, property_icals(url)")
    .eq("user_id", userId) as any;
  if (propertyId) query = query.eq("id", propertyId);
  const { data: properties, error: pErr } = await query;
  if (pErr) throw new Error(pErr.message);

  const events: any[] = [];

  // fetch each ICS feed
  await Promise.all(
    (properties || []).flatMap((p: any) =>
      (p.property_icals || []).map(async (i: any) => {
        try {
          const data = await ical.async.fromURL(i.url);
          Object.values(data).forEach((item: any) => {
            if (item.type !== "VEVENT") return;
            const start = item.start instanceof Date ? item.start.toISOString() : undefined;
            const end = item.end instanceof Date ? item.end.toISOString() : undefined;
            if (!start) return;
            const ota = detectOta(item.summary, item.uid, i.url);
            const color = ota ? OTA_COLORS[ota] : OTA_COLORS["manual"];
            events.push({
              id: item.uid || `${p.id}-${start}`,
              title: item.summary || p.name,
              start,
              end,
              allDay: !!item.datetype?.includes("date"),
              color,
              extendedProps: {
                source: "ics",
                ota,
                propertyId: p.id,
                propertyName: p.name,
                feedUrl: i.url,
              },
            });
          });
        } catch (e) {
          // ignore individual feed errors to avoid breaking the whole calendar
        }
      })
    )
  );

  return events;
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
    start: e.start,
    end: e.end ?? undefined,
    allDay: e.all_day ?? undefined,
    color: OTA_COLORS["manual"],
    extendedProps: { source: "manual", propertyId: e.property_id ?? null },
  }));

  // ics events from property feeds (best-effort)
  let icsEvents: any[] = [];
  try {
    icsEvents = await fetchIcsEventsForUser(supabase, user.id, propertyId);
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
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: payload.title,
      start: payload.start,
      end: payload.end ?? null,
      all_day: payload.allDay ?? null,
      property_id: payload.propertyId ?? null,
    })
    .select("id, title, start, end, all_day, property_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id: data.id,
    title: data.title,
    start: data.start,
    end: data.end ?? undefined,
    allDay: data.all_day ?? undefined,
    color: OTA_COLORS["manual"],
    extendedProps: { source: "manual", propertyId: data.property_id ?? null },
  });
}