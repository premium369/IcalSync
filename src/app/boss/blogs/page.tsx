import { createServiceClient } from "@/lib/supabase-server";
import AdminBlogsClient from "@/app/admin/blogs/AdminBlogsClient";

export default async function BossBlogsPage() {
  const supabase = await createServiceClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, status, views, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Blogs</h2>
        <p className="text-sm text-muted-foreground mt-1">Create, edit, and publish blog posts for organic SEO.</p>
      </div>
      <AdminBlogsClient posts={(posts || []) as any} />
    </div>
  );
}
