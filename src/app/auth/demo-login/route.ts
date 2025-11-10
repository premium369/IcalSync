import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  // Use deployment origin from the incoming request, with optional env override
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=demo_not_configured", baseUrl));
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.redirect(new URL("/login?error=demo_failed", baseUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=demo_failed", baseUrl));
  }
}

// Support GET so the homepage "Try demo" link can navigate directly
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=demo_not_configured", baseUrl));
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.redirect(new URL("/login?error=demo_failed", baseUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch {
    return NextResponse.redirect(new URL("/login?error=demo_failed", baseUrl));
  }
}