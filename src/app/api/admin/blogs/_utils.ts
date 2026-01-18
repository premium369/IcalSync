import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
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
