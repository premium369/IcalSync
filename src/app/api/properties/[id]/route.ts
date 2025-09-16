import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase-server";

type UpdatePropertyBody = { name?: string; icalUrls?: string[] };

function isValidUrl(u: string) { try { new URL(u); return true; } catch { return false; } }

async function getOwnedProperty(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  if (data.user_id !== userId) return null;
  return data;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, created_at, ical_token, user_id, property_icals(id, url, created_at)")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (data.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = {
    id: data.id,
    name: data.name,
    created_at: data.created_at,
    icalToken: (data as any).ical_token,
    icalUrls: (data.property_icals || []).map((i: any) => ({ id: i.id, url: i.url, created_at: i.created_at }))
  };
  return NextResponse.json({ data: result });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const owner = await getOwnedProperty(supabase, user.id, id);
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: UpdatePropertyBody;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const updates: any = {};
  if (typeof body.name === "string") {
    const nm = body.name.trim();
    if (!nm) return NextResponse.json({ error: "Property name is required" }, { status: 400 });
    updates.name = nm;
  }

  if (Object.keys(updates).length > 0) {
    const { error: upErr } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  if (Array.isArray(body.icalUrls)) {
    const cleaned = body.icalUrls.map((s) => (s || "").trim()).filter(Boolean);
    if (cleaned.length > 5) return NextResponse.json({ error: "You can add up to 5 iCal links" }, { status: 400 });
    for (const u of cleaned) { if (!isValidUrl(u)) return NextResponse.json({ error: `Invalid URL: ${u}` }, { status: 400 }); }

    // Replace all existing iCal rows with new set
    const { error: delErr } = await supabase
      .from("property_icals")
      .delete()
      .eq("property_id", id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    if (cleaned.length > 0) {
      const rows = cleaned.map((url) => ({ property_id: id, url }));
      const { error: insErr } = await supabase
        .from("property_icals")
        .upsert(rows, { onConflict: "property_id,url", ignoreDuplicates: true });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  const { data: full, error: selErr } = await supabase
    .from("properties")
    .select("id, name, created_at, ical_token, property_icals(id, url, created_at)")
    .eq("id", id)
    .single();
  if (selErr || !full) return NextResponse.json({ error: selErr?.message || "Not found" }, { status: 404 });

  const result = {
    id: full.id,
    name: full.name,
    created_at: full.created_at,
    icalToken: (full as any).ical_token,
    icalUrls: (full.property_icals || []).map((i: any) => ({ id: i.id, url: i.url, created_at: i.created_at }))
  };
  return NextResponse.json({ data: result });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const owner = await getOwnedProperty(supabase, user.id, id);
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: delErr } = await supabase
    .from("properties")
    .delete()
    .eq("id", id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  return NextResponse.json({ success: true });
}