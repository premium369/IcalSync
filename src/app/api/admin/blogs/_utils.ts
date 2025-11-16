import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return !!email && list.includes(email);
}

export async function requireAdmin(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false as const, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { ok: true as const, supabase, user };
}

export function validatePayload(body: any) {
  const errors: string[] = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push("title");
  if (!body.slug || String(body.slug).trim().length < 3) errors.push("slug");
  if (!body.content || String(body.content).trim().length < 10) errors.push("content");
  const status = body.status === "published" ? "published" : "draft";
  return { valid: errors.length === 0, errors, status };
}