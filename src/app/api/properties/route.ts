import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getEffectivePropertyLimit } from "@/lib/plans";

type CreatePropertyBody = { name: string; icalUrls?: string[] };

function isValidUrl(u: string) {
  try { new URL(u); return true; } catch { return false; }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("properties")
      .select("id, name, created_at, ical_token, property_icals(id, url, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      created_at: p.created_at,
      icalToken: p.ical_token,
      icalUrls: (p.property_icals || []).map((i: any) => ({ id: i.id, url: i.url, created_at: i.created_at }))
    }));
    return NextResponse.json({ data: mapped });
  } catch (e: unknown) {
    console.error("GET properties error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: CreatePropertyBody;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const name = (body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Property name is required" }, { status: 400 });

    // Enforce that a user must have a plan and respect plan limits
    try {
      const { data: planRow, error: planErr } = await supabase
        .from("user_plans")
        .select("user_id, plan, created_at")
        .eq("user_id", user.id)
        .single();
      if (planErr || !planRow) {
        return NextResponse.json(
          { error: "No plan is active for this account. Please request access on the billing page.", upgradeUrl: "/dashboard/settings" },
          { status: 403 }
        );
      }

      // Count existing properties for this user
      const { count } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const limit = getEffectivePropertyLimit(planRow as any);
      if (limit !== null && typeof count === "number" && count >= limit) {
        return NextResponse.json(
          { error: `You have reached your property limit (${limit}). Please request an upgrade on the billing page.`, upgradeUrl: "/dashboard/settings" },
          { status: 403 }
        );
      }
    } catch (_e) {
      // If plan table doesn't exist or any plan error occurs, fall back to Basic limit of 1
      const { count } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (typeof count === "number" && count >= 1) {
        return NextResponse.json(
          { error: "You have reached your property limit (1). Please request an upgrade on the billing page.", upgradeUrl: "/dashboard/settings" },
          { status: 403 }
        );
      }
    }

    const rawIcal = Array.isArray(body.icalUrls) ? body.icalUrls : [];
    const icalUrls = rawIcal.map((s) => (s || "").trim()).filter(Boolean);
    if (icalUrls.length > 5) return NextResponse.json({ error: "You can add up to 5 iCal links" }, { status: 400 });
    for (const u of icalUrls) {
      if (!isValidUrl(u)) return NextResponse.json({ error: `Invalid URL: ${u}` }, { status: 400 });
    }

    const { data: inserted, error: insErr } = await supabase
      .from("properties")
      .insert({ user_id: user.id, name })
      .select("id, name, created_at, ical_token")
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    if (icalUrls.length > 0) {
      const rows = icalUrls.map((url) => ({ property_id: inserted.id, url }));
      const { error: icalErr } = await supabase
        .from("property_icals")
        .upsert(rows, { onConflict: "property_id,url", ignoreDuplicates: true });
      if (icalErr) return NextResponse.json({ error: icalErr.message }, { status: 500 });
    }

    // Return full record
    const { data: full, error: selErr } = await supabase
      .from("properties")
      .select("id, name, created_at, ical_token, property_icals(id, url, created_at)")
      .eq("id", inserted.id)
      .single();
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    const result = {
      id: full.id,
      name: full.name,
      created_at: full.created_at,
      icalToken: full.ical_token,
      icalUrls: (full.property_icals || []).map((i: any) => ({ id: i.id, url: i.url, created_at: i.created_at }))
    };
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e: unknown) {
    console.error("POST property error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal Server Error" }, { status: 500 });
  }
}