import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const desired_plan = (body.desired_plan || "").trim();
  const message = (body.message || "").trim();
  const contact_email = (body.contact_email || "").trim();

  if (!desired_plan || !["super_host", "business", "custom"].includes(desired_plan)) {
    return NextResponse.json({ error: "Invalid desired plan" }, { status: 400 });
  }
  if (!contact_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact_email)) {
    return NextResponse.json({ error: "Valid contact email is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("upgrade_requests")
    .insert({ user_id: user.id, desired_plan, message, contact_email })
    .select("id, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}