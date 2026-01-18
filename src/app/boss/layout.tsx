
import { AdminSidebar } from "@/components/admin-sidebar";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double check auth server-side
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if Super Admin via Env Var
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const isSuperAdmin = user.email && adminEmails.includes(user.email);

  // Check Role via Supabase
  const serviceClient = await createServiceClient();
  let { data: dbUser } = await serviceClient
    .from("users")
    .select("role")
    .eq("email", user.email!)
    .single();

  // Auto-create Super Admin if missing in DB
  if (!dbUser && isSuperAdmin) {
      // We don't need to insert here if we do it in the action or just bypass
      // But for consistency, let's just bypass strict check if isSuperAdmin
      // Or we can try to insert lightly.
      // Since middleware and actions handle it, layout is mainly for visual/guard.
      // If we don't have dbUser, we can just assume admin if isSuperAdmin.
      dbUser = { role: "admin" };
  }

  if (!dbUser || (dbUser.role !== "admin" && !isSuperAdmin)) {
    // If not found or not admin, redirect.
    redirect("/dashboard");
  }

  return (
    <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950 shadow-sm overflow-hidden">
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-neutral-900 text-white border-r border-neutral-800/60">
        <AdminSidebar />
      </div>
      <main className="md:pl-72 bg-background">
        <div className="h-14 sm:h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 sm:px-6 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin panel</span>
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
