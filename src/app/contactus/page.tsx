"use client";

import { useState } from "react";

export default function ContactUsPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "icalsync.app@gmail.com";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = encodeURIComponent(`${subject || "Support Request"} — ${name || "Guest"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${supportEmail}?subject=${s}&body=${body}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Contact / Support</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">Need help? We’re always here.</p>
      </header>

      <section className="space-y-4">
        <form onSubmit={onSubmit} className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Calendar setup"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us what you need help with"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="group inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl whitespace-nowrap"
            >
              Send email
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>→</span>
            </button>
          </div>
        </form>
      </section>
      <section className="space-y-4 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">If you have any questions about your account, billing, setup, or calendar issues, reach out anytime.</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">Email: {supportEmail}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">You’ll get a response typically within 24 hours.</p>
        <div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
            aria-disabled="true"
            title="Ticket system coming soon"
          >
            Raise a ticket
          </a>
        </div>
      </section>
    </div>
  );
}