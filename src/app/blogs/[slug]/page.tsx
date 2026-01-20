import { createClient } from "@/lib/supabase-server";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 60;

type Params = { slug: string };

function imageUrl(path?: string | null) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/blog-images/${path}` : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("title, seo_title, seo_description, featured_image_path").eq("slug", slug).single();
  const title = data?.seo_title || data?.title || "Blog";
  const description = data?.seo_description || "Read more on our blog";
  const image = imageUrl(data?.featured_image_path) || "/vercel.svg";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, content, excerpt, featured_image_path, created_at, views, status")
    .eq("slug", slug)
    .single();

  if (error || !post || post.status !== "published") {
    // Debugging: show error details if in development or if requested
    console.error("Blog post error:", error, slug);
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="mt-2 text-gray-500">The requested blog post could not be loaded.</p>
        {/* Optional: Remove this in final production if sensitive */}
        {(error || !post) && (
          <pre className="mt-4 text-xs text-left bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-red-500">
            {JSON.stringify({ error, slug, status: post ? (post as any).status : "unknown" }, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Fire-and-forget analytics view increment
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/blogs/track-view`, { method: "POST", body: JSON.stringify({ id: post.id }) }).catch(() => {});

  return (
    <article className="mx-auto max-w-3xl px-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">{post.title}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(post.created_at).toLocaleDateString()} • {post.views || 0} views</div>
      </header>
      {post.featured_image_path && (
        <div className="relative w-full h-64">
          <Image src={imageUrl(post.featured_image_path) || "/vercel.svg"} alt={post.title} fill className="object-cover rounded-md" />
        </div>
      )}
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.created_at,
            image: imageUrl(post.featured_image_path) || undefined,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blogs/${post.slug}`,
          }),
        }}
      />
    </article>
  );
}