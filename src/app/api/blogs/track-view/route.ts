import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.rpc("increment_blog_view", { post_id: id });
    // Fallback: read and update
    if (error) {
      const { data: row } = await supabase.from("blog_posts").select("views").eq("id", id).single();
      const next = (row?.views || 0) + 1;
      await supabase.from("blog_posts").update({ views: next }).eq("id", id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}