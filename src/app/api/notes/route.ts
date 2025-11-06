import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type CreateBody = { propertyId: string; date: string; text: string };

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 200 });

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");

  let q = supabase
    .from("property_notes")
    .select("id, property_id, note_date, text")
    .eq("user_id", user.id)
    .order("note_date") as any;
  if (propertyId) q = q.eq("property_id", propertyId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { propertyId, date, text } = body as CreateBody;
  if (!propertyId || !date || !text) return NextResponse.json({ error: "Missing propertyId/date/text" }, { status: 400 });

  const { data, error } = await supabase
    .from("property_notes")
    .upsert({ user_id: user.id, property_id: propertyId, note_date: date, text })
    .select("id, property_id, note_date, text")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}