import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type UpdateBody = { text?: string };

async function getOwnedNote(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, id: string) {
  const { data, error } = await supabase
    .from("property_notes")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  if (data.user_id !== userId) return null;
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owner = await getOwnedNote(supabase, user.id, id);
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { text } = body as UpdateBody;
  const { data, error } = await supabase
    .from("property_notes")
    .update({ text, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, property_id, note_date, text")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owner = await getOwnedNote(supabase, user.id, id);
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase
    .from("property_notes")
    .delete()
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}