
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase-server";
import { Users, CreditCard, Activity, Clock } from "lucide-react";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createServiceClient();

  // Fetch stats
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: activeUsers } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active");
  // const { count: pendingUsers } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: pendingRequests } = await supabase.from("upgrade_requests").select("*", { count: "exact", head: true }).eq("status", "open");
  
  // Active Subscriptions (Count users with premium plans)
  const { count: activeSubs } = await supabase
    .from("user_plans")
    .select("*", { count: "exact", head: true })
    .neq("plan", "basic");

  // Recent Signups
  const { data: recentSignups } = await supabase
    .from("users")
    .select("id, email, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent Activity
  const { data: recentActivity } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

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
                <div className="text-2xl font-bold">{pendingRequests}</div>
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
             {(!recentSignups || recentSignups.length === 0) ? (
                 <p className="text-muted-foreground text-sm">No recent signups.</p>
             ) : (
                 <Table>
                     <TableHeader>
                         <TableRow>
                             <TableHead>Email</TableHead>
                             <TableHead>Status</TableHead>
                             <TableHead className="text-right">Joined</TableHead>
                         </TableRow>
                     </TableHeader>
                     <TableBody>
                         {recentSignups.map((u: any) => (
                             <TableRow key={u.id}>
                                 <TableCell className="font-medium">{u.email}</TableCell>
                                 <TableCell>
                                     <Badge variant={u.status === 'active' ? 'success' : 'secondary'}>{u.status}</Badge>
                                 </TableCell>
                                 <TableCell className="text-right text-muted-foreground">
                                     {new Date(u.created_at).toLocaleDateString()}
                                 </TableCell>
                             </TableRow>
                         ))}
                     </TableBody>
                 </Table>
             )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             {(!recentActivity || recentActivity.length === 0) ? (
                 <p className="text-muted-foreground text-sm">No recent activity.</p>
             ) : (
                 <div className="space-y-4">
                     {recentActivity.map((log: any) => (
                         <div key={log.id} className="flex items-start gap-4 text-sm border-b pb-2 last:border-0">
                             <div className="grid gap-1">
                                 <div className="font-semibold">{log.action.replace(/_/g, " ")}</div>
                                 <div className="text-muted-foreground text-xs">
                                     {new Date(log.created_at).toLocaleString()}
                                 </div>
                                 {log.details && (
                                     <div className="text-xs text-muted-foreground mt-1 bg-muted p-1 rounded">
                                         {JSON.stringify(log.details).substring(0, 50)}...
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
