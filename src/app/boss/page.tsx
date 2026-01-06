
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase-server";
import { Users, CreditCard, Activity, Clock } from "lucide-react";

import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createServiceClient();

  // Fetch stats
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: activeUsers } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active");
  const { count: pendingUsers } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "pending");
  
  // Active Subscriptions (Count users with premium plans)
  const { count: activeSubs } = await supabase
    .from("user_plans")
    .select("*", { count: "exact", head: true })
    .neq("plan", "basic");

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Link href="/boss/requests" className="block">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingUsers}</div>
            </CardContent>
            </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground text-sm">No recent signups.</p>
             {/* TODO: List recent users */}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground text-sm">No recent activity.</p>
             {/* TODO: List audit logs */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
