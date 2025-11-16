import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import AdminBlogsClient from "./AdminBlogsClient";
import { createServiceClient } from "@/lib/supabase-server";

function isAdmin(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return !!email && list.includes(email);
}

export default async function AdminBlogs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Access denied</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">Admin only. Please sign in with an admin email.</p>
        <Link href="/login" className="mt-4 inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm">Go to login</Link>
      </div>
    );
  }

  const svc = await createServiceClient();
  const { data: posts } = await svc
    .from("blog_posts")
    .select("id, slug, title, status, views, created_at")
    .order("created_at", { ascending: false });

  return <AdminBlogsClient posts={(posts || []) as any} />;
}