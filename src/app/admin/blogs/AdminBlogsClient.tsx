"use client";
import { useCallback, useMemo, useState } from "react";

type PostRow = {
  id: string;
  slug: string | null;
  title: string;
  status: "draft" | "published" | string;
  views: number | null;
  created_at: string;
};

export default function AdminBlogsClient({ posts }: { posts: PostRow[] }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("Admin");
  const [published, setPublished] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setAuthorName("Admin");
    setPublished(false);
    setImageFile(null);
    setError(null);
  }, []);

  const slugify = useCallback((s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  , []);

  const openNew = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const openEdit = useCallback(async (id: string) => {
    setSaving(false);
    setError(null);
    const res = await fetch("/api/admin/blogs/get?id=" + id);
    const j = await res.json();
    const p = j.post || {};
    setEditingId(id);
    setTitle(p.title || "");
    setSlug(p.slug || "");
    setContent(p.content || "");
    setExcerpt(p.excerpt || "");
    setAuthorName(p.author_name || "Admin");
    setPublished(p.status === "published");
    setImageFile(null);
    setShowModal(true);
  }, []);

  const onDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch("/api/admin/blogs/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (res.ok) location.reload();
    else alert("Delete failed");
  }, []);

  const onSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const useSlug = slug || slugify(title);
      const payload: any = {
        title,
        slug: useSlug,
        content,
        excerpt,
        author_name: authorName,
        status: published ? "published" : "draft",
      };
      if (imageFile && imageFile.size > 0) {
        const up = new FormData();
        up.append("file", imageFile);
        const resUpload = await fetch("/api/admin/blogs/upload", { method: "POST", body: up });
        if (!resUpload.ok) throw new Error("Image upload failed");
        const j = await resUpload.json();
        if (j.path) payload.featured_image_path = j.path;
      }
      const url = editingId ? "/api/admin/blogs/update" : "/api/admin/blogs/create";
      const body = editingId ? { ...payload, id: editingId } : payload;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Save failed");
      }
      location.reload();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }, [editingId, title, slug, content, excerpt, authorName, published, imageFile, slugify]);

  return (
    <div className="mx-auto max-w-5xl px-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold">Admin • Blogs</h1>
        <button onClick={openNew} className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white text-sm">New post</button>
      </header>

      <section className="space-y-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-400">
              <th className="py-2">Title</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Status</th>
              <th className="py-2">Views</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(posts || []).map((p) => (
              <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="py-2">{p.title}</td>
                <td className="py-2">{p.slug}</td>
                <td className="py-2">{p.status}</td>
                <td className="py-2">{p.views || 0}</td>
                <td className="py-2">
                  <button className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs" onClick={() => openEdit(p.id)}>Edit</button>
                  <button className="ml-2 rounded-md border border-red-300 text-red-700 px-3 py-1 text-xs" onClick={() => onDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="card-surface w-[700px] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editingId ? "Edit post" : "New post"}</h2>
              <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <div className="mt-3 space-y-3">
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div>
                <label className="text-sm">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="text-sm">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="text-sm">HTML content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="HTML content" className="mt-1 w-full rounded-md border px-3 py-2 h-40" />
              </div>
              <div>
                <label className="text-sm">Excerpt</label>
                <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="text-sm">Author Name</label>
                <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author Name" className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="text-sm">Featured image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-1 w-full" />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                  Published
                </label>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="rounded-md border px-3 py-1" onClick={() => { setShowModal(false); }}>
                  Cancel
                </button>
                <button disabled={saving} onClick={onSave} className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white text-sm">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}