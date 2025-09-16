import { NextResponse } from "next/server";
import ical from "node-ical";
import { createServiceClient } from "@/lib/supabase-server";

function toIcsDate(dt: Date) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}
function toIcsDateValue(dt: Date) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
function foldLine(line: string) {
  // Simple folding at 75 octets, prepend space for continuation
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 75) {
    parts.push((i === 0 ? "" : " ") + line.slice(i, i + 75));
  }
  return parts.join("\r\n");
}
function escapeText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,|;/g, (m) => `\\${m}`);
}

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!token) return new NextResponse("Not found", { status: 404 });

  const supabase = await createServiceClient();
  // Find property by token
  const { data: property, error: pErr } = await supabase
    .from("properties")
    .select("id, name, user_id, ical_token, property_icals(url)")
    .eq("ical_token", token)
    .single();
  if (pErr || !property) return new NextResponse("Not found", { status: 404 });

  // Manual events for this property
  const { data: manual, error: eErr } = await supabase
    .from("events")
    .select("id, title, start, end, all_day")
    .eq("property_id", property.id)
    .order("start");
  if (eErr) return new NextResponse("Server error", { status: 500 });

  // Fetch ICS from connected feeds for this property
  let icsItems: any[] = [];
  const feeds = (property as any).property_icals || [];
  await Promise.all(
    feeds.map(async (i: any) => {
      try {
        const cal = await ical.async.fromURL(i.url);
        Object.values(cal).forEach((it: any) => { if (it.type === "VEVENT") icsItems.push({ feedUrl: i.url, item: it }); });
      } catch (e) {
        // ignore individual feed errors
      }
    })
  );

  type ExportEvent = { uid: string; summary: string; start: Date; end?: Date | null; allDay?: boolean };
  const exportEvents: ExportEvent[] = [];

  // Map manual blocks
  (manual || []).forEach((e: any) => {
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : null;
    exportEvents.push({ uid: e.id, summary: e.title || "Blocked", start, end, allDay: !!e.all_day });
  });

  // Map ics items
  for (const { item } of icsItems) {
    if (!item.start) continue;
    const start: Date = item.start instanceof Date ? item.start : new Date(item.start);
    const end: Date | null = item.end ? (item.end instanceof Date ? item.end : new Date(item.end)) : null;
    const allDay = !!item.datetype?.includes?.("date");
    exportEvents.push({ uid: item.uid || `${property.id}-${start.toISOString()}`, summary: item.summary || "Reserved", start, end, allDay });
  }

  // Build ICS content
  const now = new Date();
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ical Sync//Availability//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(property.name)} Availability`,
    "X-WR-TIMEZONE:UTC",
    "X-PUBLISHED-TTL:PT10M",
  ];

  const eventsIcs: string[] = exportEvents.map((ev) => {
    const lines: string[] = ["BEGIN:VEVENT"];    
    lines.push(foldLine(`UID:${ev.uid}`));
    lines.push(`DTSTAMP:${toIcsDate(now)}`);
    const isAll = !!ev.allDay;
    if (isAll) {
      lines.push(`DTSTART;VALUE=DATE:${toIcsDateValue(ev.start)}`);
      if (ev.end) {
        // DTEND is exclusive for VALUE=DATE; if end has time at 00:00 of next day already, keep; else add 1 day
        const endDate = new Date(Date.UTC(ev.end.getUTCFullYear(), ev.end.getUTCMonth(), ev.end.getUTCDate()));
        lines.push(`DTEND;VALUE=DATE:${toIcsDateValue(endDate)}`);
      }
    } else {
      lines.push(`DTSTART:${toIcsDate(ev.start)}`);
      if (ev.end) lines.push(`DTEND:${toIcsDate(ev.end)}`);
    }
    lines.push(foldLine(`SUMMARY:${escapeText(ev.summary || "Blocked")}`));
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  });

  const body = header.concat(eventsIcs).concat(["END:VCALENDAR"]).join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Disposition": `attachment; filename=\"${property.name.replace(/[^a-z0-9_-]+/gi, "-")}-availability.ics\"`,
    },
  });
}