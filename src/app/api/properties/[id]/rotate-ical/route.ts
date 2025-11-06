import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase-server";

type ApiOneResponse = { data?: any; error?: string };

function uuidv4(): string {
  // Prefer secure randomUUID when available (Node 19+/Edge runtime), fallback to Math.random-based
  const anyGlobal: any = globalThis as any;
  if (anyGlobal?.crypto?.randomUUID) return anyGlobal.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owner = await getOwnedProperty(supabase, user.id, id);
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate new token in app, then persist
  const newToken = uuidv4();
  const { error: updErr } = await supabase
    .from("properties")
    .update({ ical_token: newToken })
    .eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

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

  return NextResponse.json({ data: result } as ApiOneResponse);
}