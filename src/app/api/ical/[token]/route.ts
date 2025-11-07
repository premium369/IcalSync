import { NextRequest, NextResponse } from "next/server";
import ical from "node-ical";
import { createServiceClient } from "@/lib/supabase-server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
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

  // NOTE: For export feeds consumed by OTAs (Airbnb, Booking.com),
  // we only export MANUAL blocks created in this app.
  // Avoid re-exporting imported OTA bookings to prevent duplication/loops.
  // If needed later, this can be made configurable per property.

  type ExportEvent = { uid: string; summary: string; start: Date; end?: Date | null; allDay?: boolean };
  const exportEvents: ExportEvent[] = [];

  // Map manual blocks
  (manual || []).forEach((e: any) => {
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : null;
    exportEvents.push({ uid: e.id, summary: e.title || "Blocked", start, end, allDay: !!e.all_day });
  });

  // Do not include imported ICS items in export

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
    // Hint to consumers that updates may be published frequently
    "X-PUBLISHED-TTL:PT5M",
  ];

  const eventsIcs: string[] = exportEvents.map((ev) => {
    const lines: string[] = ["BEGIN:VEVENT"];    
    lines.push(foldLine(`UID:${ev.uid}`));
    lines.push(`DTSTAMP:${toIcsDate(now)}`);
    const isAll = !!ev.allDay;
    if (isAll) {
      lines.push(`DTSTART;VALUE=DATE:${toIcsDateValue(ev.start)}`);
      // DTEND for VALUE=DATE is exclusive. Our stored end from the UI is already exclusive.
      if (ev.end) {
        const endDateExclusive = new Date(
          Date.UTC(
            ev.end.getUTCFullYear(),
            ev.end.getUTCMonth(),
            ev.end.getUTCDate()
          )
        );
        lines.push(`DTEND;VALUE=DATE:${toIcsDateValue(endDateExclusive)}`);
      } else {
        const nextDay = new Date(
          Date.UTC(
            ev.start.getUTCFullYear(),
            ev.start.getUTCMonth(),
            ev.start.getUTCDate() + 1
          )
        );
        lines.push(`DTEND;VALUE=DATE:${toIcsDateValue(nextDay)}`);
      }
    } else {
      lines.push(`DTSTART:${toIcsDate(ev.start)}`);
      if (ev.end) {
        lines.push(`DTEND:${toIcsDate(ev.end)}`);
      } else {
        // Provide a minimal duration to ensure some OTAs treat it as blocking
        const oneHourLater = new Date(ev.start.getTime() + 60 * 60 * 1000);
        lines.push(`DTEND:${toIcsDate(oneHourLater)}`);
      }
    }
    lines.push(foldLine(`SUMMARY:${escapeText(ev.summary || "Blocked")}`));
    // Explicitly mark as confirmed and opaque so OTAs block availability
    lines.push(`STATUS:CONFIRMED`);
    lines.push(`TRANSP:OPAQUE`);
    // Optional hint
    lines.push(foldLine(`DESCRIPTION:${escapeText("Blocked via caldne")}`));
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  });

  const body = header.concat(eventsIcs).concat(["END:VCALENDAR"]).join("\r\n") + "\r\n";
  const etag = crypto.createHash("sha256").update(body).digest("hex");
  const lastModified = new Date().toUTCString();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Disable caching to ensure OTAs always fetch the freshest data
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "ETag": etag,
      "Last-Modified": lastModified,
      "Content-Disposition": `attachment; filename=\"${property.name.replace(/[^a-z0-9_-]+/gi, "-")}-availability.ics\"`,
    },
  });
}