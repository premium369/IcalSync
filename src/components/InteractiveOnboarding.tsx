"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StepId =
  | "home"
  | "mobile_menu"
  | "nav_properties"
  | "props_info_name"
  | "props_info_paste"
  | "props_info_add"
  | "props_info_export"
  | "nav_calendar"
  | "calendar_info_overview"
  | "calendar_info_select"
  | "calendar_info_block"
  | "calendar_info_note"
  | "nav_howto"
  | "nav_settings"
  | "finish";

type StepConfig = {
  id: StepId;
  path?: string;
  anchor?: string; // data-tour-id value
  title: string;
  text: string;
  require?: "click" | "input" | "none";
};

const BASE_STEPS: StepConfig[] = [
  { id: "home", path: "/dashboard", title: "Welcome", text: "Welcome.", require: "none" },
  { id: "nav_properties", path: "/dashboard/properties", anchor: "nav-properties", title: "Go to Properties", text: "Navigate to Properties.", require: "click" },
  { id: "props_info_name", path: "/dashboard/properties", anchor: "prop-name-input", title: "Add property name", text: "Here you can add a property name.", require: "none" },
  { id: "props_info_paste", path: "/dashboard/properties", anchor: "prop-ical-input", title: "Paste iCal links", text: "Paste iCal from Airbnb, Booking, Vrbo, others.", require: "none" },
  { id: "props_info_add", path: "/dashboard/properties", anchor: "prop-add-btn", title: "Add property", text: "Click Add property to save.", require: "none" },
  { id: "props_info_export", path: "/dashboard/properties", title: "Export iCal", text: "Use the provided iCal to sync OTAs. Watch demo for more.", require: "none" },
  { id: "nav_calendar", path: "/dashboard/calendar", anchor: "nav-calendar", title: "Go to Calendar", text: "Navigate to Calendar.", require: "click" },
  { id: "calendar_info_overview", path: "/dashboard/calendar", title: "Unified view", text: "View all bookings in one place.", require: "none" },
  { id: "calendar_info_select", path: "/dashboard/calendar", anchor: "calendar-property-select", title: "Select property", text: "Choose a property from the dropdown.", require: "none" },
  { id: "calendar_info_block", path: "/dashboard/calendar", title: "Block dates", text: "Click dates to block; syncs to connected platforms.", require: "none" },
  { id: "calendar_info_note", path: "/dashboard/calendar", title: "Add notes", text: "Add cleaning or party notes per day.", require: "none" },
  { id: "nav_settings", path: "/dashboard/settings", anchor: "nav-settings", title: "Settings", text: "View your plan.", require: "click" },
  { id: "finish", title: "All set!", text: "Watch the demo or contact us. Done!", require: "none" },
];

export default function InteractiveOnboarding({ demo }: { demo: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const watchDemoUrl = "https://www.youtube.com/watch?v=XXXXXXXXXXX";
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [inputTouched, setInputTouched] = useState(false);
  const [anchorClicked, setAnchorClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const steps = useMemo(() => {
    if (isMobile) {
      const withMobile: StepConfig[] = [{ id: "mobile_menu", anchor: "mobile-menu-toggle", title: "Open menu", text: "Tap here to open navigation.", require: "click" }, ...BASE_STEPS];
      return withMobile;
    }
    return BASE_STEPS;
  }, [isMobile]);

  const current = steps[index] || steps[0];
  const progress = useMemo(() => ((index + 1) / steps.length), [index, steps.length]);
  const anchorEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setAnchorClicked(false);
  }, [current.id]);

  useEffect(() => {
    const completed = typeof window !== "undefined" && localStorage.getItem("onboardingCompleted") === "true";
    if (demo) setOpen(true);
    else setOpen(!completed);
  }, [demo]);

  useEffect(() => {
    if (!open || paused) return;
    if (current.path && pathname !== current.path) router.push(current.path);
  }, [open, paused, current.path, pathname, router]);


  useEffect(() => {
    // Highlight target element
    if (!open) return;
    // cleanup previous
    if (anchorEl.current) {
      anchorEl.current.classList.remove("ring-2","ring-blue-500","rounded-md","animate-pulse");
      anchorEl.current = null;
    }
    const sel = current.anchor;
    if (!sel) return;
    const el = document.querySelector<HTMLElement>(`[data-tour-id='${sel}']`);
    if (el) {
      anchorEl.current = el;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2","ring-blue-500","rounded-md","animate-pulse");
      if (current.require === "input") {
        const lastVal = (el as HTMLInputElement).value;
        const onInput = () => {
          const v = (el as HTMLInputElement).value;
          if (v && v !== lastVal) setInputTouched(true);
        };
        el.addEventListener("input", onInput, { once: true });
      }
    }
    return () => {
      if (anchorEl.current) anchorEl.current.classList.remove("ring-2","ring-blue-500","rounded-md","animate-pulse");
    };
  }, [open, current.anchor, current.require]);

  const canNext = () => {
    if (current.require === "none") return true;
    if (current.require === "input") return inputTouched;
    if (current.require === "click") {
      const isNavStep = current.id === "nav_properties" || current.id === "nav_howto" || current.id === "nav_settings" || current.id === "nav_calendar";
      if (isNavStep) {
        if (current.path && pathname === current.path) return true;
        return false;
      }
      return anchorClicked;
    }
    return true;
  };

  useEffect(() => {
    if (!open) return;
    if (current.require !== "click" || !current.anchor) return;
    const el = document.querySelector<HTMLElement>(`[data-tour-id='${current.anchor}']`);
    if (!el) return;
    const handler = () => {
      setAnchorClicked(true);
    };
    el.addEventListener("click", handler, { once: true });
    return () => el.removeEventListener("click", handler);
  }, [open, current.anchor, current.require]);

  const next = () => {
    if (!canNext()) return;
    setInputTouched(false);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const skip = () => finish();
  const pause = () => setPaused(true);
  const resume = () => setPaused(false);
  const restart = () => { setIndex(0); setPaused(false); setInputTouched(false); };
  const finish = () => {
    try { localStorage.setItem("onboardingCompleted", "true"); } catch {}
    // Reset demo form inputs without touching server data
    try {
      document.querySelectorAll<HTMLElement>("[data-tour-id='prop-name-input']").forEach((el) => ((el as HTMLInputElement).value = ""));
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800">
        <div className="h-1 bg-blue-600" style={{ width: `${Math.max(8, Math.floor(progress*100))}%` }} />
      </div>
      {/* control bubble */}
      <div className="pointer-events-auto fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-[360px] rounded-xl bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-white/10 shadow-lg p-4">
        <div className="text-sm font-semibold">{current.title}</div>
        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{current.text}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={prev} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Back</button>
          {current.id !== "finish" && (
            <button onClick={next} className={`rounded-md px-3 py-1.5 text-sm ${canNext()?"bg-blue-600 text-white":"bg-blue-600/40 text-white/70"}`}>Next</button>
          )}
          {!paused ? (
            <button onClick={pause} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Pause</button>
          ) : (
            <button onClick={resume} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Resume</button>
          )}
          <button onClick={restart} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Restart</button>
          <a href={watchDemoUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm">Watch Demo</a>
          {current.id === "finish" ? (
            <button onClick={finish} className="ml-auto rounded-md bg-blue-600 text-white text-sm px-3 py-1.5">Done</button>
          ) : (
            <button onClick={skip} className="ml-auto rounded-md text-sm px-3 py-1.5">Skip</button>
          )}
        </div>
      </div>
    </div>
  );
}
