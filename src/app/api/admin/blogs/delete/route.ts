import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_utils";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const svc = await createServiceClient();
  const { error } = await svc.from("blog_posts").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}