import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || null;
  const env = process.env.VERCEL ? "vercel" : "local";

  const checks = {
    supabaseUrl: !!supabaseUrl,
    supabaseAnon: !!supabaseAnon,
    serviceRole: !!serviceRole,
    adminEmailsConfigured: adminEmails.length > 0,
    siteUrlConfigured: !!siteUrl,
  };

  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json({ ok, env, checks });
}