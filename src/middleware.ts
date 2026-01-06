import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Skip auth cookie sync when Supabase env is not configured yet
    return res;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Partial<ResponseCookie>) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Partial<ResponseCookie>) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  // If hitting /login while authenticated, send to dashboard
  if (pathname.startsWith("/login") && data.user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard") && !data.user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect /boss (Admin) routes
  if (pathname.startsWith("/boss")) {
    if (!data.user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 1. Check Environment Variable (Bypass DB check for Super Admins)
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
    if (data.user.email && adminEmails.includes(data.user.email)) {
        return res; // Allow access immediately
    }

    // 2. Check role in database
    // Note: We use the Supabase client to query the 'users' table (Prisma model User mapped to 'users')
    // Ensure you have a 'users' table with 'role' column synced with auth.
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("role")
      .eq("email", data.user.email) // Assuming email is the link, or use id if synced
      .single();

    if (error || !dbUser) {
        console.error("Middleware: Failed to fetch user role", error);
    } else {
        console.log(`Middleware: User ${data.user.email} has role ${dbUser.role}`);
    }

    if (!dbUser || dbUser.role !== "admin") {
       console.log("Middleware: Access denied. Redirecting to dashboard.");
       // Redirect unauthorized users to dashboard or 403
       const redirectUrl = req.nextUrl.clone();
       redirectUrl.pathname = "/dashboard";
       return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp)$).*)"],
};
