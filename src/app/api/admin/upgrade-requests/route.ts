import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let svc;
  try {
    svc = await createServiceClient();
  } catch (e: any) {
    return NextResponse.json({ error: "Service role not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment." }, { status: 500 });
  }

  const { data, error } = await svc
    .from("upgrade_requests")
    .select("id, user_id, desired_plan, message, contact_email, status, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let svc;
  try {
    svc = await createServiceClient();
  } catch (e: any) {
    return NextResponse.json({ error: "Service role not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment." }, { status: 500 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const id = body.id;
  const action = (body.action || "").trim();
  const new_plan = (body.new_plan || "").trim();
  if (!id || !action) return NextResponse.json({ error: "id and action are required" }, { status: 400 });

  const { data: reqRow, error: findErr } = await svc
    .from("upgrade_requests")
    .select("id, user_id, desired_plan, status")
    .eq("id", id)
    .single();
  if (findErr || !reqRow) return NextResponse.json({ error: findErr?.message || "Request not found" }, { status: 404 });

  if (action === "approve") {
    const targetPlan = (new_plan || reqRow.desired_plan);
    if (!["super_host", "business"].includes(targetPlan)) {
      return NextResponse.json({ error: "Approvals must set plan to super_host or business" }, { status: 400 });
    }
    // Upsert user plan to targetPlan
    const { error: upErr } = await svc
      .from("user_plans")
      .upsert({ user_id: reqRow.user_id, plan: targetPlan }, { onConflict: "user_id" });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: updated, error: updErr } = await svc
      .from("upgrade_requests")
      .update({ status: "approved" })
      .eq("id", id)
      .select("id, status")
      .single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ data: updated });
  }

  if (action === "deny") {
    const { data: updated, error: updErr } = await svc
      .from("upgrade_requests")
      .update({ status: "denied" })
      .eq("id", id)
      .select("id, status")
      .single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    return NextResponse.json({ data: updated });
  }

  if (action === "review") {
    const { data: updated, error: updErr } = await svc
      .from("upgrade_requests")
      .update({ status: "reviewed" })
      .eq("id", id)
      .select("id, status")
      .single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    return NextResponse.json({ data: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}