import { NextRequest, NextResponse } from "next/server";
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
  if (line.length <= 75) return line;
  let result = line.slice(0, 75);
  let remaining = line.slice(75);
  while (remaining.length > 0) {
    // Continuation lines start with a space, so we take 74 chars to make total 75
    result += "\r\n " + remaining.slice(0, 74);
    remaining = remaining.slice(74);
  }
  return result;
}
function escapeText(text: string) {
  // RFC 5545: escape backslash, newline, comma, semicolon
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
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

  type ExportEvent = { uid: string; summary: string; start: Date; end?: Date | null; allDay?: boolean };
  const exportEvents: ExportEvent[] = [];

  // Map manual blocks
  (manual || []).forEach((e: any) => {
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : null;
    exportEvents.push({ uid: e.id, summary: e.title || "Blocked", start, end, allDay: !!e.all_day });
  });

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
    "X-PUBLISHED-TTL:PT5M",
  ];

  const eventsIcs: string[] = exportEvents.map((ev) => {
    const lines: string[] = ["BEGIN:VEVENT"];    
    lines.push(foldLine(`UID:${ev.uid}`));
    lines.push(`DTSTAMP:${toIcsDate(now)}`);
    const isAll = !!ev.allDay;
    if (isAll) {
      lines.push(`DTSTART;VALUE=DATE:${toIcsDateValue(ev.start)}`);
      if (ev.end) {
        // DTEND is exclusive
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
        const oneHourLater = new Date(ev.start.getTime() + 60 * 60 * 1000);
        lines.push(`DTEND:${toIcsDate(oneHourLater)}`);
      }
    }
    lines.push(foldLine(`SUMMARY:${escapeText(ev.summary || "Blocked")}`));
    lines.push(`STATUS:CONFIRMED`);
    lines.push(`TRANSP:OPAQUE`); // OPAQUE = blocked
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
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "ETag": etag,
      "Last-Modified": lastModified,
      // Removed Content-Disposition attachment to allow inline viewing and avoid issues with some OTAs
      // "Content-Disposition": `attachment; filename=\"${property.name.replace(/[^a-z0-9_-]+/gi, "-")}-availability.ics\"`,
    },
  });
}
