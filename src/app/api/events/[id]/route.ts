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

  const updates: any = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.start !== undefined) updates.start = body.start;
  if (body.end !== undefined) updates.end = body.end;
  if (body.allDay !== undefined) updates.all_day = body.allDay;

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, title, start, end, all_day")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id: data.id,
    title: data.title,
    start: data.start,
    end: data.end ?? undefined,
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