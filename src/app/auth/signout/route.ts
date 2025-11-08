import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  return NextResponse.redirect(new URL("/login", baseUrl));
}