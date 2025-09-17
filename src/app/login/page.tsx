"use client";
import { Auth } from "@supabase/auth-ui-react";
import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginPageInner() {
  const [supabase] = useState(() => createBrowserSupabase());
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
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Welcome back. Please sign in to continue.</p>

        {error && (
          <div className="mb-4 rounded-md border border-red-300/60 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm" aria-live="polite">
            {error === "demo_not_configured" && "Demo login is not configured. Set DEMO_EMAIL and DEMO_PASSWORD in .env.local."}
            {error === "demo_failed" && "Demo login failed. Please try again using your email and password."}
          </div>
        )}

        {/* Minimal, Android-working Supabase Auth UI (email + password only) */}
        <Auth
          supabaseClient={supabase as any}
          view="sign_in"
          providers={[]}
          magicLink={false}
          redirectTo={typeof window !== "undefined" ? window.location.origin : undefined}
        />
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