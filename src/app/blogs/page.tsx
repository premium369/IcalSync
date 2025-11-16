import { createClient } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // simple ISR caching

type SearchParams = {
  page?: string;
  q?: string;
  sort?: "new" | "old" | "views";
};

async function fetchBlogs(sp: SearchParams) {
  const supabase = await createClient();
  const page = Math.max(1, Number(sp.page || 1));
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, featured_image_path, views, created_at, status", { count: "exact" })
    .eq("status", "published");

  if (sp.q && sp.q.trim().length > 0) {
    const term = `%${sp.q.trim()}%`;
    query = query.or(`title.ilike.${term},content.ilike.${term}`);
  }

  const sort = sp.sort || "new";
  if (sort === "new") query = query.order("created_at", { ascending: false });
  else if (sort === "old") query = query.order("created_at", { ascending: true });
  else if (sort === "views") query = query.order("views", { ascending: false });

  query = query.range(from, to);
  try {
    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: data || [], count: count || 0, page, pageSize };
  } catch {
    // Gracefully handle missing table/columns or RLS errors by returning empty list
    return { posts: [], count: 0, page, pageSize };
  }
}

function imageUrl(path?: string | null) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/blog-images/${path}` : null;
}

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const { posts, count, page, pageSize } = await fetchBlogs(searchParams);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const q = searchParams.q || "";
  const sort = searchParams.sort || "new";
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Blogs</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">Latest updates, tips, and product notes.</p>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <form className="flex flex-wrap items-center gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts..."
            className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-transparent"
          />
          <select name="sort" defaultValue={sort} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-transparent text-sm">
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
            <option value="views">Most viewed</option>
          </select>
          <button className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white text-sm">Apply</button>
        </form>

        {posts.length === 0 ? (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            No published posts yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <article key={p.id} className="card-surface overflow-hidden">
                {p.featured_image_path && (
                  <div className="relative h-32 w-full">
                    <Image src={imageUrl(p.featured_image_path) || "/vercel.svg"} alt={p.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg"><Link href={`/blogs/${p.slug || p.id}`}>{p.title}</Link></h2>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{p.excerpt || ""}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="inline-flex items-center gap-1"><span aria-hidden>👁️</span>{p.views || 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={{ pathname: "/blogs", query: { q, sort, page: n } }}
              className={`rounded-md px-3 py-1 text-sm border ${n === page ? "bg-blue-600 text-white border-blue-600" : "border-neutral-200 dark:border-neutral-800"}`}
            >
              {n}
            </Link>
          ))}
        </div>
      </section>

      {/* Basic structured data list */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "blogPosts": posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              datePublished: p.created_at,
              image: imageUrl(p.featured_image_path) || undefined,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blogs/${p.slug || p.id}`,
            })),
          }),
        }}
      />
    </div>
  );
}