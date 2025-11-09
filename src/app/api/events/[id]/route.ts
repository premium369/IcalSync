import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const EventSchema = z.object({
  title: z.string().min(1),
  start: z.string(),
  end: z.string().optional(),
  allDay: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const body = await req.json();
  const parsed = EventSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  function isDateOnly(s?: string | null) {
    return !!s && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s);
  }
  function toMidnightUtcIso(dateOnly: string) {
    const y = Number(dateOnly.slice(0, 4));
    const m = Number(dateOnly.slice(5, 7)) - 1;
    const d = Number(dateOnly.slice(8, 10));
    return new Date(Date.UTC(y, m, d, 0, 0, 0, 0)).toISOString();
  }

  const updates: any = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.start !== undefined) updates.start = (body.allDay && isDateOnly(body.start)) ? toMidnightUtcIso(body.start) : body.start;
  if (body.end !== undefined) updates.end = (body.allDay && isDateOnly(body.end)) ? toMidnightUtcIso(body.end) : body.end;
  if (body.allDay !== undefined) updates.all_day = body.allDay;

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, title, start, end, all_day")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  function toDateOnly(iso: string) {
    try { return new Date(iso).toISOString().slice(0, 10); } catch { return iso; }
  }
  return NextResponse.json({
    id: data.id,
    title: data.title,
    start: data.all_day ? toDateOnly(data.start) : data.start,
    end: data.all_day ? (data.end ? toDateOnly(data.end) : undefined) : (data.end ?? undefined),
    allDay: data.all_day ?? undefined,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}