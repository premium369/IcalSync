"use client";
import { Auth } from "@supabase/auth-ui-react";
import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeMinimal } from "@supabase/auth-ui-shared";
import type { SupabaseClient } from "@supabase/supabase-js";

function LoginPageInner() {
  const [supabase] = useState<SupabaseClient>(() => createBrowserSupabase());
  const [redirected, setRedirected] = useState(false);
  const params = useSearchParams();
  const error = params.get("error");

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
      <div className="card-surface p-6">
        <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Sign in</h1>
        <p className="text-sm mb-6 text-gray-600 dark:text-gray-300">Welcome back. Please sign in to continue.</p>

        {error && (
          <div className="mb-4 rounded-md border border-red-300/60 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm" aria-live="polite">
            {error === "demo_not_configured" && "Demo login is not configured. Set DEMO_EMAIL and DEMO_PASSWORD in .env.local."}
            {error === "demo_failed" && "Demo login failed. Please try again using your email and password."}
          </div>
        )}

        {/* Minimal, Android-working Supabase Auth UI (email + password only) */}
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          providers={[]}
          magicLink={false}
          redirectTo={
            (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL)
              ? process.env.NEXT_PUBLIC_SITE_URL
              : typeof window !== "undefined"
                ? window.location.origin
                : undefined
          }
          appearance={
            {
              theme: ThemeMinimal,
              variables: {
                default: {
                  colors: {
                    brand: "#2563eb",
                    brandAccent: "#1d4ed8",
                    background: "#ffffff",
                    text: "#111827",
                    inputBackground: "#ffffff",
                    inputText: "#111827",
                    anchorText: "#2563eb",
                  },
                  radii: { input: "0.5rem", button: "0.375rem" },
                },
                dark: {
                  colors: {
                    brand: "#60a5fa",
                    brandAccent: "#3b82f6",
                  },
                },
              },
              style: {
                container: { background: "transparent", border: "0", boxShadow: "none" },
                input: { backgroundColor: "#ffffff", color: "#111827", borderColor: "rgba(0,0,0,0.15)", borderRadius: "0.5rem", padding: "0.625rem 0.75rem" },
                anchor: { color: "#2563eb" },
                button: { borderRadius: "0.375rem" },
              },
              className: "supabase-auth",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any
            }
        />

        <div className="mt-4">
          <form action="/auth/demo-login" method="post">
            <button
              type="submit"
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-transform"
            >
              Try Demo
            </button>
          </form>
        </div>
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
