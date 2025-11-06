"use client";
import { useEffect, useMemo, useState } from "react";

type ReqRow = {
  id: string;
  user_id: string;
  desired_plan: "super_host" | "business" | "custom";
  message: string | null;
  contact_email: string;
  status: "pending" | "reviewed" | "approved" | "denied";
  created_at: string;
};

function Badge({ status }: { status: ReqRow["status"] }) {
  const map: Record<ReqRow["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
  };
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

export default function AdminUpgradeRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ReqRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/upgrade-requests", { cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const j = await res.json();
      setList(j.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, action: "approve" | "deny" | "review", new_plan?: "super_host" | "business") {
    const res = await fetch("/api/admin/upgrade-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, new_plan }),
    });
    if (res.ok) await load();
  }

  const sorted = useMemo(() => list.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [list]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Admin · Upgrade Requests</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Review and process plan upgrade requests.</p>
      </div>

      {error && <div className="rounded border border-red-200 text-red-800 bg-red-50 p-3 text-sm">{error}</div>}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="text-left px-3 py-2">Created</th>
              <th className="text-left px-3 py-2">User</th>
              <th className="text-left px-3 py-2">Desired</th>
              <th className="text-left px-3 py-2">Contact</th>
              <th className="text-left px-3 py-2">Message</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-2" colSpan={7}>Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td className="px-3 py-2" colSpan={7}>No requests</td></tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.user_id}</td>
                  <td className="px-3 py-2 capitalize">{r.desired_plan.replace("_"," ")}</td>
                  <td className="px-3 py-2">{r.contact_email}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.message || ""}</td>
                  <td className="px-3 py-2"><Badge status={r.status} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button className="rounded-md bg-green-600 text-white px-2 py-1 hover:bg-green-700" onClick={() => act(r.id, "approve", r.desired_plan === "custom" ? "super_host" : r.desired_plan)}>Approve</button>
                      <button className="rounded-md bg-red-600 text-white px-2 py-1 hover:bg-red-700" onClick={() => act(r.id, "deny")}>Deny</button>
                      <button className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => act(r.id, "review")}>Mark Reviewed</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}