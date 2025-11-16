"use client";
import { useEffect, useMemo, useState } from "react";
import { plansCatalog, SUPER_HOST_LIMIT } from "@/lib/plans";

type PlanRow = {
  user_id: string;
  plan: "basic" | "super_host" | "custom";
};

export default function BillingInner() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [countProps, setCountProps] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [desired, setDesired] = useState<"super_host" | "custom">("super_host");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trialActive = false;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [planRes, propRes] = await Promise.all([
          fetch("/api/billing/plan", { cache: "no-store" }),
          fetch("/api/properties?head=count", { cache: "no-store" }),
        ]);
        if (planRes.ok) {
          const pj = await planRes.json();
          setPlan(pj.data ?? null);
        }
        if (propRes.ok) {
          const prj = await propRes.json();
          const list = prj.data || [];
          setCountProps(Array.isArray(list) ? list.length : null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/upgrade-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desired_plan: desired, message, contact_email: contact }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Billing</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Upgrade requests only. Payments to be added later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plansCatalog.map((p) => (
          <div key={p.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 className="font-semibold">{p.title}</h3>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{p.propertyLimitLabel}</div>
            <div className="mt-2 text-2xl font-bold">{p.price}</div>
            <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {p.features.map((f) => (<li key={f}>• {f}</li>))}
            </ul>
            <a
              href="#request"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700 active:scale-95 transition-transform"
              onClick={() => setDesired(p.id as any)}
            >{p.cta}</a>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="font-semibold">Your plan</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : plan ? (
          <div className="text-sm">
            <div>Plan: <span className="font-medium capitalize">{plan.plan.replace("_"," ")}</span></div>
            <div>Properties in use: {countProps ?? "—"}</div>
          </div>
        ) : (
          <div className="text-sm">
            <div className="mb-2 text-gray-500">No plan is active yet.</div>
            <a href="#request" className="inline-flex rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" onClick={() => setDesired("super_host")}>Request access</a>
          </div>
        )}
      </div>

      <form id="request" onSubmit={submitRequest} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <h3 className="font-semibold">Request access</h3>
        {submitted ? (
          <div className="text-sm text-green-600">Thanks! We received your request. We will email you soon.</div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm">Desired plan</label>
              <select value={desired} onChange={(e) => setDesired(e.target.value as any)} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                <option value="super_host">Super Host</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">Contact email</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} type="email" required placeholder="you@example.com" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"/>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">Message (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" placeholder="Tell us about your requirements"/>
            </div>
            <button disabled={submitting} className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-60 active:scale-95 transition-transform">{submitting ? "Sending…" : "Send request"}</button>
          </>
        )}
      </form>
    </div>
  );
}