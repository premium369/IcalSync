
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, CreditCard, FileText, ShieldAlert, Settings } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/boss",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/boss/users",
    color: "text-violet-500",
  },
  {
    label: "Requests",
    icon: Users,
    href: "/boss/requests",
    color: "text-yellow-500",
  },
  {
    label: "Plans",
    icon: FileText,
    href: "/boss/plans",
    color: "text-pink-700",
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/boss/payments",
    color: "text-emerald-500",
  },
  {
    label: "Blogs",
    icon: FileText,
    href: "/boss/blogs",
    color: "text-indigo-500",
  },
  {
    label: "Audit Logs",
    icon: ShieldAlert,
    href: "/boss/audit",
    color: "text-orange-700",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#020617] text-white">
      <div className="px-3 py-2 flex-1 flex flex-col gap-6">
        <Link href="/boss" className="flex items-center pl-2 mt-1">
          <span className="text-lg font-semibold tracking-tight">Caldne Admin</span>
        </Link>
        <div className="space-y-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 px-2">
          <span>Navigation</span>
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex px-3 py-2 w-full justify-start font-medium cursor-pointer rounded-lg transition-colors",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
