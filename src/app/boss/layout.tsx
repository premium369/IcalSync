
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
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <AdminSidebar />
      </div>
      <main className="md:pl-72">
        <div className="h-16 border-b flex items-center px-6 bg-white dark:bg-black">
             <div className="ml-auto flex items-center gap-x-4">
                <span className="text-sm font-medium">Admin: {user.email}</span>
             </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
