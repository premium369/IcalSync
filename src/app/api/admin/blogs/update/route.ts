import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, validatePayload } from "../_utils";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const { valid, errors, status } = validatePayload(body);
  if (!valid) return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });
  const svc = await createServiceClient();
  // Prevent slug conflicts with other posts
  const { data: conflicts, error: confErr } = await svc
    .from("blog_posts")
    .select("id")
    .eq("slug", body.slug)
    .neq("id", body.id)
    .limit(1);
  if (confErr) return NextResponse.json({ error: confErr.message }, { status: 500 });
  if (conflicts && conflicts.length) return NextResponse.json({ error: "slug_exists" }, { status: 400 });
  const update = {
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt || null,
    author_name: body.author_name || "Admin",
    author_email: auth.user.email,
    featured_image_path: body.featured_image_path || null,
    status,
  };
  const { error } = await svc.from("blog_posts").update(update).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}