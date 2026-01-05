"use client";
import { useEffect, useMemo, useState } from "react";

type Step = 1|2|3|4|5|6|7|8|9|10;

export default function OnboardingFlow({ demo }: { demo: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [propertyName, setPropertyName] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [icalUrl, setIcalUrl] = useState("");
  const [extraIcals, setExtraIcals] = useState<string[]>([]);

  useEffect(() => {
    const completed = typeof window !== "undefined" && localStorage.getItem("onboardingCompleted") === "true";
    if (demo) {
      setOpen(true);
      return;
    }
    setOpen(!completed);
  }, [demo]);

  const progress = useMemo(() => step / 10, [step]);
  const watchDemoUrl = "https://www.youtube.com/watch?v=XXXXXXXXXXX";

  const close = () => {
    localStorage.setItem("onboardingCompleted", "true");
    setOpen(false);
  };

  const copyExportLink = () => {
    const link = "https://icalsync.app/export/PROPERTY_TOKEN";
    try { navigator.clipboard.writeText(link); } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3 sm:p-6">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white ring-1 ring-neutral-200 dark:ring-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="text-sm">Step {step} of 10</div>
          <div className="w-24 h-1 bg-neutral-200 dark:bg-neutral-800 rounded">
            <div className="h-1 bg-blue-600 rounded" style={{ width: `${Math.max(8, Math.floor(progress*100))}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Welcome to iCalSync</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Let’s get your calendars synced and hosting stress-free.</div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <button className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(2)}>Continue</button>
              <a href={watchDemoUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm text-center">Watch Demo</a>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Add your property</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Give your place a name so you can manage it easily.</div>
            <input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="Property name" className="mt-3 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Where is this property listed?</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: "airbnb", label: "Airbnb" },
                { id: "vrbo", label: "Vrbo" },
                { id: "booking", label: "Booking.com" },
                { id: "other", label: "Others" },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setPlatform(opt.id)} className={(platform===opt.id?"bg-blue-600 text-white":"bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white")+" rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800 px-3 py-2 text-sm"}>{opt.label}</button>
              ))}
            </div>
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(4)}>Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Add your iCal link</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Copy your iCal link from your OTA and paste it here.</div>
            <input value={icalUrl} onChange={(e) => setIcalUrl(e.target.value)} placeholder="iCal URL" className="mt-3 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(5)}>Connect</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Add more platforms?</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">If this property is listed elsewhere, paste those iCal links too.</div>
            <div className="space-y-2 mt-2">
              {extraIcals.map((u, i) => (
                <input key={i} value={u} onChange={(e) => {
                  const arr = [...extraIcals]; arr[i] = e.target.value; setExtraIcals(arr);
                }} placeholder="Another iCal URL" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm" onClick={() => setExtraIcals([...extraIcals, ""])}>Add another</button>
              <button className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(6)}>Skip</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Activate syncing</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Your iCalSync link is ready. To complete syncing, paste this link into your OTA’s import calendar section.</div>
            <div className="mt-3 rounded-md border border-neutral-200 dark:border-neutral-800 p-3 text-sm">Copy iCalSync export link</div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <button className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={copyExportLink}>Copy link</button>
              <a href={watchDemoUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm text-center">Watch Demo</a>
              <button className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(7)}>Continue</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Auto-sync is now active</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Your bookings will update across all connected platforms automatically.</div>
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(8)}>Next</button>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Your unified calendar</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">All your bookings in one clean view.</div>
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(9)}>Next</button>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">Stay protected</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">If we detect overlapping dates, we’ll alert you instantly.</div>
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={() => setStep(10)}>Next</button>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="p-5 space-y-3">
            <div className="text-2xl font-semibold">You’re ready!</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Add more properties anytime. Everything is now synced.</div>
            <div className="mt-4">
              <button className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm" onClick={close}>Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
