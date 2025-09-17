"use client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { useEffect, useRef, useState, useLayoutEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    // Eye open
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  // Eye closed (off)
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 102.83 2.83" />
      <path d="M9.88 4.24A9.73 9.73 0 0112 4c6.5 0 10 8 10 8a19.36 19.36 0 01-3.3 4.74" />
      <path d="M6.35 6.35C3.94 7.86 2 12 2 12a19.38 19.38 0 006.11 6.11" />
    </svg>
  );
}

function PasswordVisibilityToggles({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const [targets, setTargets] = useState<Array<{ input: HTMLInputElement; parent: HTMLElement }>>([]);
  const [visible, setVisible] = useState(() => new Map<HTMLInputElement, boolean>());
  const lastInputsRef = useRef<Set<HTMLInputElement>>(new Set());
  const rafId = useRef<number | null>(null);
  const clonesRef = useRef<Map<HTMLInputElement, HTMLInputElement>>(new Map());
  const registerClone = useCallback((base: HTMLInputElement, clone: HTMLInputElement | null) => {
    const map = clonesRef.current;
    if (clone) map.set(base, clone);
    else map.delete(base);
  }, []);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Helper: overlay text input clone on iOS to avoid type toggling glitches
  function TwinInput({ input, parent, show, registerClone }: { input: HTMLInputElement; parent: HTMLElement; show: boolean; registerClone: (base: HTMLInputElement, clone: HTMLInputElement | null) => void; }) {
    const ref = useRef<HTMLInputElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ position: 'absolute', zIndex: 9, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none' });
  
    useLayoutEffect(() => {
      const coarse = typeof window !== 'undefined' && 'matchMedia' in window && window.matchMedia('(pointer: coarse)').matches;
      const gapForEye = 8 + (coarse ? 40 : 32); // keep space on right for eye button
      const compute = () => {
        const cs = window.getComputedStyle(parent);
        if (!['relative','absolute','fixed'].includes(cs.position)) parent.style.position = 'relative';
        const rectParent = parent.getBoundingClientRect();
        const rect = input.getBoundingClientRect();
        const left = (rect.left - rectParent.left);
        const top = (rect.top - rectParent.top);
        setStyle((prev) => ({ ...prev, position: 'absolute', left, top, width: rect.width, height: rect.height, transform: 'translate(0,0)', zIndex: 9 }));
      };
      compute();
      let ro: ResizeObserver | null = null;
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(() => compute());
        ro.observe(input);
        ro.observe(parent);
      }
      const onWin = () => compute();
      window.addEventListener('resize', onWin);
      window.addEventListener('scroll', onWin, true);
      return () => {
        window.removeEventListener('resize', onWin);
        window.removeEventListener('scroll', onWin, true);
        ro?.disconnect();
      };
    }, [input, parent]);
  
    // Register clone and synchronize values in both directions
    useEffect(() => {
      const node = ref.current;
      if (!node) return;
      registerClone(input, node);
      // Initialize with the same value
      if (node.value !== input.value) node.value = input.value;
  
      const syncFromOriginal = () => {
        if (node.value !== input.value) node.value = input.value;
      };
      const syncToOriginal = (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        if (input.value !== v) {
          input.value = v;
          // Dispatch input event so React/Supabase listeners get notified
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      input.addEventListener('input', syncFromOriginal);
      node.addEventListener('input', syncToOriginal);
      return () => {
        input.removeEventListener('input', syncFromOriginal);
        node.removeEventListener('input', syncToOriginal);
        registerClone(input, null);
      };
    }, [input, registerClone]);
  
    // Reflect visibility in style
    useEffect(() => {
      setStyle((prev) => ({ ...prev, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none' }));
    }, [show]);
  
    return createPortal(
      <input
        ref={ref}
        type="text"
        aria-hidden={!show}
        className={input.className}
        placeholder={input.placeholder}
        // Ensure enough right padding for the eye button
        style={{ ...style, boxSizing: 'border-box', paddingRight: '3rem' }}
        autoCapitalize={input.autocapitalize || 'off' as any}
        autoCorrect={"off"}
        spellCheck={false}
      />,
      parent
    );
  }

  // Helper: button that portals into parent and positions itself relative to the input
  function EyeButton({ input, parent, getClone }: { input: HTMLInputElement; parent: HTMLElement; getClone: () => HTMLInputElement | undefined }) {
    const [style, setStyle] = useState<React.CSSProperties>({ position: 'absolute', zIndex: 10 });
  
    useLayoutEffect(() => {
      const coarse = typeof window !== 'undefined' && 'matchMedia' in window && window.matchMedia('(pointer: coarse)').matches;
      const btnSize = coarse ? 40 : 32; // larger touch target on mobile
      const gap = 8; // px from input edge
      const compute = () => {
        // Ensure parent is positioning context
        const cs = window.getComputedStyle(parent);
        if (!['relative','absolute','fixed'].includes(cs.position)) {
          parent.style.position = 'relative';
        }
        const rectParent = parent.getBoundingClientRect();
        const rect = input.getBoundingClientRect();
        const left = (rect.left - rectParent.left) + rect.width - btnSize - gap;
        const top = (rect.top - rectParent.top) + rect.height / 2;
        setStyle({ position: 'absolute', left, top, transform: 'translateY(-50%)', width: btnSize, height: btnSize, zIndex: 10 });
      };
      compute();
  
      let ro: ResizeObserver | null = null;
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(() => compute());
        ro.observe(input);
        ro.observe(parent);
      }
      const onWin = () => compute();
      window.addEventListener('resize', onWin);
      window.addEventListener('scroll', onWin, true);
      return () => {
        window.removeEventListener('resize', onWin);
        window.removeEventListener('scroll', onWin, true);
        ro?.disconnect();
      };
    }, [input, parent]);
  
    const preventBlur = (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
  
    return createPortal(
      <button
        type="button"
        data-eye-btn
        onPointerDown={preventBlur}
        onMouseDown={preventBlur}
        onTouchStart={preventBlur}
        onClick={() => {
          if (isIOS) {
            const nextVisible = !visible.get(input);
            setVisible((prev) => new Map(prev).set(input, nextVisible));
            // Focus the appropriate field and restore caret
            setTimeout(() => {
              const target = nextVisible ? getClone() : input;
              if (target) {
                try {
                  const active = document.activeElement as HTMLInputElement | null;
                  const s = active?.selectionStart ?? target.value.length;
                  const e = active?.selectionEnd ?? target.value.length;
                  target.focus({ preventScroll: true });
                  if (typeof s === 'number' && typeof e === 'number' && 'setSelectionRange' in target) {
                    (target as HTMLInputElement).setSelectionRange(s, e);
                  }
                } catch {}
              }
            }, 0);
            return;
          }
          // Non‑iOS: safe to toggle type directly
          const hadFocus = document.activeElement === input;
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const isText = input.type === 'text';
          input.type = isText ? 'password' : 'text';
          if (!isText) {
            input.setAttribute('data-eye-target', '');
          } else {
            input.removeAttribute('data-eye-target');
          }
          setVisible((prev) => new Map(prev).set(input, !isText));
          if (hadFocus) {
            setTimeout(() => {
              try {
                input.focus({ preventScroll: true });
                const pos = start != null && end != null ? { s: start, e: end } : { s: input.value.length, e: input.value.length };
                input.setSelectionRange(pos.s, pos.e);
              } catch {}
            }, 0);
          }
        }}
        aria-label={visible.get(input) ? "Hide password" : "Show password"}
        aria-pressed={visible.get(input) ? true : false}
        title={visible.get(input) ? "Hide password" : "Show password"}
        className="absolute grid place-items-center rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={style}
      >
        <EyeIcon open={!!visible.get(input)} />
      </button>,
      parent
    );
  }

  // Scan for password inputs under the Auth widget and prepare portal targets (debounced, equality-checked)
  useEffect(() => {
    const scheduleScan = () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(scan);
    };

    const scan = () => {
      rafId.current = null;
      const container = root.current;
      if (!container) return;
      const found = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"], input[type="text"][data-eye-target]'));

      // Also sanitize email input behavior to avoid iOS auto-corrections/capitalization
      const email = container.querySelector<HTMLInputElement>('input[type="email"]');
      if (email) {
        try {
          email.setAttribute('autocapitalize', 'off');
          email.setAttribute('autocorrect', 'off');
          email.setAttribute('spellcheck', 'false');
          email.setAttribute('autocomplete', 'email');
          email.setAttribute('inputmode', 'email');
        } catch {}
      }

       // Build a Set for identity comparison
       const newSet = new Set(found);
       const prevSet = lastInputsRef.current;
       let changed = false;
      if (newSet.size !== prevSet.size) {
        changed = true;
      } else {
        for (const el of newSet) {
          if (!prevSet.has(el)) { changed = true; break; }
        }
      }
      if (!changed) return; // No structural changes -> skip state updates

      const prepared: Array<{ input: HTMLInputElement; parent: HTMLElement }> = [];
      for (const input of found) {
        const parent = input.parentElement as HTMLElement | null;
        if (!parent) continue;
        // Ensure the parent can host absolutely positioned button
        const style = window.getComputedStyle(parent);
        if (!['relative', 'absolute', 'fixed'].includes(style.position)) {
          parent.style.position = 'relative';
        }
        // Mark this group so we can style compact/expanded sizes via CSS
        parent.setAttribute('data-pw-group', '');
        input.setAttribute('data-pw-input', '');

        // Safety: ensure masked by default unless explicitly toggled to text
        if (!input.hasAttribute('data-eye-target') && input.type !== 'password') {
          try { input.type = 'password'; } catch {}
        }

        // Prevent mobile keyboards from altering the typed password/email
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
        if (input.type === 'password') {
          input.setAttribute('autocomplete', 'current-password');
          input.setAttribute('inputmode', 'text');
        }

         // Add right padding so the button doesn't overlap characters
         const currentPaddingRight = parseFloat(window.getComputedStyle(input).paddingRight || '0');
         const desiredPadding = 48; // 3rem
         if (currentPaddingRight < desiredPadding) {
           input.style.paddingRight = '3rem';
         }
         prepared.push({ input, parent });
      }

      // Update targets only when changed
      setTargets(prepared);
      // Update visible map: add new inputs with default, remove missing inputs
      setVisible((prev) => {
        const next = new Map(prev);
        // add
        for (const input of newSet) {
          if (!next.has(input)) next.set(input, input.type === 'text');
        }
        // remove
        for (const input of Array.from(next.keys())) {
          if (!newSet.has(input)) next.delete(input);
        }
        return next;
      });

      // Commit the new set
      lastInputsRef.current = newSet;
    };

    // Initial scan
    const initId = requestAnimationFrame(scan);

    // Observe DOM changes inside the auth widget (view switching sign in <-> sign up)
    const obs = new MutationObserver((records) => {
      // Ignore mutations caused solely by our own eye buttons
      const onlyOurButtons = records.length > 0 && records.every((r) => {
        const added = Array.from(r.addedNodes);
        const removed = Array.from(r.removedNodes);
        const all = added.concat(removed);
        return all.length > 0 && all.every((n) => n instanceof HTMLElement && (n as HTMLElement).hasAttribute('data-eye-btn'));
      });
      if (onlyOurButtons) return;
      scheduleScan();
    });
    if (root.current) {
      obs.observe(root.current, { childList: true, subtree: true });
    }
    return () => {
      obs.disconnect();
      cancelAnimationFrame(initId);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [root]);

  return (
    <>
      {targets.map(({ input, parent }, idx) => (
        <TwinInput key={`tw-${idx}`} input={input} parent={parent} show={!!visible.get(input)} registerClone={registerClone} />
      ))}
      {targets.map(({ input, parent }, idx) => (
        <EyeButton key={`btn-${idx}`} input={input} parent={parent} getClone={() => clonesRef.current.get(input)} />
      ))}
    </>
  );
}

function LoginPageInner() {
  const [supabase] = useState(() => createBrowserSupabase());
  const [redirected, setRedirected] = useState(false);
  const params = useSearchParams();
  const error = params.get("error");
  const authRootRef = useRef<HTMLDivElement>(null);
  const [iosFallbackError, setIosFallbackError] = useState<string | null>(null);
  const [iosFallbackLoading, setIosFallbackLoading] = useState(false);
  const force = params.get("force");
  const isIOS = (() => {
    if (force === "ios") return true;
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const platform = (navigator as any).platform || "";
    const maxTouchPoints = (navigator as any).maxTouchPoints || 0;
    const uaIOS = /iPad|iPhone|iPod/i.test(ua);
    const iPadOSMacLike = platform === "MacIntel" && maxTouchPoints > 1;
    return uaIOS || iPadOSMacLike;
  })();
  const [iosDiag, setIosDiag] = useState<{ emailLen: number; emailTrimDelta: number; pwLen: number; lastAuthMsg: string }>({ emailLen: 0, emailTrimDelta: 0, pwLen: 0, lastAuthMsg: "" });
   // Local state for iOS-only custom form
   const [iosEmail, setIosEmail] = useState("");
   const [iosPassword, setIosPassword] = useState("");
   const [iosShowPw, setIosShowPw] = useState(false);
   const [iosSubmitting, setIosSubmitting] = useState(false);
  const supabaseHost = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return url ? new URL(url).host : "(unset)";
    } catch {
      return "(invalid url)";
    }
  })();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  // Hide any third-party provider buttons/dividers if the Auth UI renders them
  useEffect(() => {
    const root = authRootRef.current;
    if (!root) return;
    const hideProviders = () => {
      const btns = root.querySelectorAll<HTMLElement>(
        'button[data-provider], button[aria-label*="Sign in with" i], button[aria-label*="Continue with" i]'
      );
      btns.forEach((b) => (b.style.display = "none"));
      // Hide nearby dividers/separators if present
      root.querySelectorAll<HTMLElement>('hr, [role="separator"]').forEach((el) => (el.style.display = "none"));
    };
    hideProviders();
    const mo = new MutationObserver(() => hideProviders());
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
 
  // On iOS: sanitize email before the Auth UI submits to avoid hidden whitespace/autocorrect issues
  useEffect(() => {
    if (!isIOS) return;
    const root = authRootRef.current;
    if (!root) return;
    const onSubmitCapture = (e: Event) => {
      try {
        const targetEl = e.target as Element | null;
        const form = (targetEl && 'closest' in targetEl ? (targetEl as Element).closest('form') : null) as HTMLFormElement | null;
        if (!form) return;
         const email = form.querySelector<HTMLInputElement>('input[type="email"]');
         if (email) {
           const trimmed = email.value.trim();
           if (trimmed !== email.value) {
             email.value = trimmed;
             email.dispatchEvent(new Event('input', { bubbles: true }));
           }
         }
      } catch { /* noop */ }
    };
    // Use capture to run before inner handlers
    root.addEventListener('submit', onSubmitCapture, true);
    return () => root.removeEventListener('submit', onSubmitCapture, true);
  }, [isIOS]);

  // iOS diagnostics: track input lengths and last auth message (no secrets)
  useEffect(() => {
    if (!isIOS) return;
    const root = authRootRef.current;
    if (!root) return;
    const update = () => {
      const emailEl = root.querySelector<HTMLInputElement>('input[type="email"]');
      const pwEl = root.querySelector<HTMLInputElement>('input[type="password"], input[type="text"][data-eye-target]');
      if (emailEl) {
        const v = emailEl.value ?? "";
        const t = v.trim();
        setIosDiag(prev => ({ ...prev, emailLen: v.length, emailTrimDelta: v.length - t.length }));
      }
      if (pwEl) {
        const p = pwEl.value ?? "";
        setIosDiag(prev => ({ ...prev, pwLen: p.length }));
      }
    };
    const onInput = (e: Event) => update();
    // listen to input events on container
    root.addEventListener('input', onInput, true);
    // run once
    update();
    return () => root.removeEventListener('input', onInput, true);
  }, [isIOS]);

  useEffect(() => {
    if (!isIOS) return;
    const root = authRootRef.current;
    if (!root) return;
    const pickMsg = () => {
      const el = root.querySelector<HTMLElement>('[role="alert"], [data-testid*="message" i], .supabase-auth-ui_ui-message, [class*="message"]');
      const txt = el?.textContent?.trim() || "";
      if (txt) setIosDiag(prev => ({ ...prev, lastAuthMsg: txt }));
    };
    // initial pull and observe for changes
    pickMsg();
    const mo = new MutationObserver(() => pickMsg());
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [isIOS]);
 
  // If already signed in, send to dashboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted && data.user && !redirected) {
        setRedirected(true);
        window.location.href = "/dashboard";
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase, redirected]);
 
  // On new sign-in, send to dashboard
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" && !redirected) {
        setRedirected(true);
        window.location.href = "/dashboard";
      }
    });
    return () => {
      listener.subscription?.unsubscribe();
    };
  }, [supabase, redirected]);
 
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Sign in or create your account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Welcome back. Please sign in to continue.</p>
 
        {error && (
          <div className="mb-4 rounded-md border border-red-300/60 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm" aria-live="polite">
            {error === "demo_not_configured" && "Demo login is not configured. Set DEMO_EMAIL and DEMO_PASSWORD in .env.local."}
            {error === "demo_failed" && "Demo login failed. Please try again using your email and password."}
          </div>
        )}
 
        <div ref={authRootRef} className="auth-email-only">
          {isIOS ? (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setIosFallbackError(null);
                setIosSubmitting(true);
                try {
                  const email = iosEmail.trim();
                  const password = iosPassword;
                  if (!email || !password) {
                    setIosFallbackError("Please enter both email and password.");
                  } else {
                    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (signInError) {
                      setIosFallbackError(signInError.message || "Sign in failed. Please check your credentials.");
                    }
                  }
                } catch (err: any) {
                  setIosFallbackError(err?.message || "Unexpected error during sign in.");
                } finally {
                  setIosSubmitting(false);
                }
              }}
            >
              {iosFallbackError && (
                <div className="rounded-md border border-amber-300/60 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-2 text-xs" aria-live="polite">
                  {iosFallbackError}
                </div>
              )}
              <div>
                <label htmlFor="ios-email" className="sr-only">Email</label>
                <input
                  id="ios-email"
                  type="email"
                  required
                  value={iosEmail}
                  onChange={(e) => setIosEmail(e.target.value)}
                   onInput={(e) => setIosEmail((e.target as HTMLInputElement).value)}
                   placeholder="Email address"
                   autoCapitalize="off"
                   autoCorrect="off"
                   spellCheck={false}
                   inputMode="email"
                   autoComplete="email"
                   className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:placeholder-gray-400"
                 />
              </div>
              <div className="relative">
                <label htmlFor="ios-password" className="sr-only">Password</label>
                <input
                  id="ios-password"
                  type={iosShowPw ? "text" : "password"}
                  required
                  value={iosPassword}
                  onChange={(e) => setIosPassword(e.target.value)}
                   onInput={(e) => setIosPassword((e.target as HTMLInputElement).value)}
                   placeholder="Password"
                   autoCapitalize="off"
                   autoCorrect="off"
                   spellCheck={false}
                   autoComplete="current-password"
                   inputMode="text"
                   style={{ paddingRight: "3rem" }}
                   className="w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200 dark:placeholder-gray-400"
                 />
                <button
                  type="button"
                  onClick={() => setIosShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-pressed={iosShowPw}
                  aria-label={iosShowPw ? "Hide password" : "Show password"}
                  title={iosShowPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={iosShowPw} />
                </button>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={iosSubmitting}
              >
                {iosSubmitting ? "Signing in…" : "Sign in"}
              </button>
              {/* Tiny diagnostics (temporary) - shows no secrets */}
              <div className="text-[11px] text-gray-500 dark:text-gray-400" aria-live="polite">
                iOS diagnostics — Email length: {iosEmail.length}, Trim delta: {iosEmail.length - iosEmail.trim().length}, Password length: {iosPassword.length}
                 <div className="mt-1">Branch: {isIOS ? "iOS custom" : "Auth UI"}{force === "ios" ? " (forced)" : ""}</div>
                 <div className="mt-1">Supabase host: {supabaseHost}</div>
                 <div className="mt-1 truncate" title={userAgent}>UA: {userAgent}</div>
               </div>
            </form>
          ) : (
            <>
              <Auth
                supabaseClient={supabase as any}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "#2563eb",
                        brandAccent: "#1d4ed8",
                        inputText: "#111827",
                        inputPlaceholder: "#6b7280",
                        inputBackground: "#ffffff",
                        inputBorder: "#e5e7eb",
                        messageText: "#111827",
                      },
                      fonts: {
                        bodyFontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
                        buttonFontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
                        inputFontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
                      },
                      space: {
                        inputPadding: "10px 12px",
                        buttonPadding: "10px 12px",
                      },
                      borderWidths: { inputBorderWidth: "1px" },
                      radii: { inputBorderRadius: "8px", buttonBorderRadius: "8px" },
                    },
                    dark: {
                      colors: {
                        inputText: "#e5e7eb",
                        inputPlaceholder: "#9ca3af",
                        inputBackground: "#0b0b0b",
                        inputBorder: "#262626",
                        messageText: "#e5e7eb",
                      },
                    },
                  },
                }}
                redirectTo={typeof window !== "undefined" ? window.location.origin : undefined}
                view="sign_in"
                showLinks={true}
                magicLink={false}
                providers={[]}
                localization={{
                  variables: {
                    sign_in: { email_label: "Email address" },
                  },
                }}
              />
              {/* Eye toggle portals for both Login and Signup views rendered by Supabase Auth */}
              <PasswordVisibilityToggles root={authRootRef} />
            </>
          )}
          {/* Scoped CSS hard-hides any residual social buttons/separators just in case */}
          <style jsx global>{`
            .auth-email-only button[data-provider],
            .auth-email-only button[aria-label*="Sign in with" i],
            .auth-email-only button[aria-label*="Continue with" i],
            .auth-email-only a[aria-label*="Sign in with" i],
            .auth-email-only a[aria-label*="Continue with" i],
            .auth-email-only [data-testid="social-buttons"],
            .auth-email-only [data-provider-id],
            .auth-email-only [role="separator"],
            .auth-email-only hr {
              display: none !important;
            }
            /* Keep inputs identical in size; prevent iOS zoom; ensure consistent box sizing */
            .auth-email-only input {
              box-sizing: border-box;
              width: 100%;
              height: 44px; /* match email field height */
              padding: 10px 12px; /* matches Supabase variables above */
              font-size: 16px; /* prevents iOS zoom */
              color: #111827 !important; /* ensure visible text in light mode */
              -webkit-text-fill-color: currentColor !important; /* iOS Safari explicit text color */
              caret-color: currentColor !important;
              background-color: #ffffff !important; /* avoid transparent/contrast issues */
              -webkit-appearance: none;
              appearance: none;
              text-rendering: optimizeLegibility;
              color-scheme: light !important; /* prevent Safari auto-darkening from inverting input text */
              text-shadow: 0 0 0 currentColor; /* paint fix for iOS invisible text */
              opacity: 1 !important; /* defeat odd compositing */
              mix-blend-mode: normal !important;
              filter: none !important;
              backface-visibility: hidden;
              transform: translateZ(0);
            }
            .auth-email-only input::placeholder {
              color: #6b7280 !important;
              opacity: 1; /* iOS sometimes lowers placeholder opacity */
            }
            .auth-email-only input[type="password"] {
              color: #111827 !important;
              -webkit-text-fill-color: currentColor !important;
            }
            /* Autofill overrides (iOS/Safari) */
            .auth-email-only input:-webkit-autofill,
            .auth-email-only input:-webkit-autofill:hover,
            .auth-email-only input:-webkit-autofill:focus,
            .auth-email-only input:-webkit-autofill:active {
            -webkit-text-fill-color: #111827 !important;
            transition: background-color 9999s ease-out 0s, color 9999s ease-out 0s;
            caret-color: #111827 !important;
            }
             /* Dark mode explicit color to ensure visibility */
             html.dark .auth-email-only input {
               color: #e5e7eb !important;
               -webkit-text-fill-color: currentColor !important;
               caret-color: currentColor !important;
               background-color: #0b0b0b !important;
               color-scheme: light !important; /* still force light scheme to avoid auto-inversion */
             }
             html.dark .auth-email-only input::placeholder {
               color: #9ca3af !important;
               opacity: 1;
             }
             html.dark .auth-email-only input[type="password"] {
               color: #e5e7eb !important;
               -webkit-text-fill-color: currentColor !important;
             }
            html.dark .auth-email-only input:-webkit-autofill,
            html.dark .auth-email-only input:-webkit-autofill:hover,
            html.dark .auth-email-only input:-webkit-autofill:focus,
            html.dark .auth-email-only input:-webkit-autofill:active {
            -webkit-text-fill-color: #e5e7eb !important;
            caret-color: #e5e7eb !important;
            }
           `}</style>
        </div>
 
        {/* Removed divider and Demo login option */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}