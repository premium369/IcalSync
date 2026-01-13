import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import ical from "node-ical";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function detectOta(summary: string | undefined, uid: string | undefined, url?: string) {
  const text = `${summary || ""} ${uid || ""} ${url || ""}`.toLowerCase();
  if (text.includes("airbnb")) return "airbnb";
  if (text.includes("booking")) return "booking";
  if (text.includes("vrbo") || text.includes("homeaway")) return "vrbo";
  if (text.includes("expedia")) return "expedia";
  return undefined;
}

export async function GET(req: NextRequest) {
  // Admin check via auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = getAdminEmails();
  if (!user || !adminEmails.includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const svc = await createServiceClient();
  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");
  const ownerId = url.searchParams.get("userId");

  // Select properties to sync
  let query = svc.from("properties").select("id, name, user_id, property_icals(url)");
  if (propertyId) query = query.eq("id", propertyId);
  if (ownerId) query = query.eq("user_id", ownerId);
  const { data: properties, error: pErr } = await query;
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const results: Array<{ property_id: string; feeds: number; eventsProcessed: number; error?: string }> = [];

  for (const p of (properties || [])) {
    const feeds = (p.property_icals || []) as Array<{ url: string }>;
    let eventsProcessed = 0;
    let error: string | undefined;

    try {
      for (const feed of feeds) {
        try {
          const data = await ical.async.fromURL(feed.url);
          for (const item of Object.values(data)) {
            const ev: any = item;
            if (ev.type !== "VEVENT") continue;
            const start = ev.start instanceof Date ? ev.start.toISOString() : undefined;
            const end = ev.end instanceof Date ? ev.end.toISOString() : undefined;
            if (!start) continue;
            const allDay = !!ev.datetype?.includes("date");
            const uid = ev.uid || `${p.id}-${start}`;
            const title = ev.summary || p.name;
            const ota = detectOta(ev.summary, ev.uid, feed.url);
            const row = {
              user_id: p.user_id,
              property_id: p.id,
              uid,
              title,
              start,
              end,
              all_day: allDay,
              source: "ics",
              feed_url: feed.url,
              ota,
              updated_at: new Date().toISOString(),
            };
            const { error: upErr } = await svc
              .from("external_events")
              .upsert(row, { onConflict: "property_id,uid" });
            if (!upErr) eventsProcessed += 1;
          }
        } catch (_e) {
          // continue with other feeds
        }
      }
    } catch (e: any) {
      error = e?.message || "sync failed";
    }

    // Write sync status
    await svc
      .from("property_syncs")
      .upsert({
        property_id: p.id,
        last_synced_at: new Date().toISOString(),
        feeds_count: feeds.length,
        events_processed: eventsProcessed,
        error,
        updated_at: new Date().toISOString(),
      }, { onConflict: "property_id" });

    // Audit
    await svc.from("audit_logs").insert({
      action: "SYNC_ICAL",
      admin_id: user.id,
      target_id: p.id,
      details: { feeds: feeds.length, eventsProcessed, error },
    });

    results.push({ property_id: p.id, feeds: feeds.length, eventsProcessed, error });
  }

  return NextResponse.json({ ok: true, results });
}

