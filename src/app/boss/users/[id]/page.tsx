
import { createServiceClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserActions } from "../user-actions";
import { ChangePlanDialog } from "@/components/change-plan-dialog";
import { plansCatalog } from "@/lib/plans";
import { PropertySyncActions } from "../property-sync-actions";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  mode: string;
  status: string;
  createdAt: Date;
}

async function getUser(id: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select(`
        *,
        subscription:subscriptions(*),
        payments(*),
        adminNotes:admin_notes(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Fetch plan from user_plans
  const { data: userPlan } = await supabase
    .from("user_plans")
    .select("plan, created_at")
    .eq("user_id", id)
    .single();

  // Fetch properties for this user
  const { data: props } = await supabase
    .from("properties")
    .select("id, name, created_at, property_icals(url)")
    .eq("user_id", id);
  const propertyIds = (props || []).map((p: any) => p.id);
  // Fetch last sync status
  let syncMap: Record<string, any> = {};
  if (propertyIds.length > 0) {
    const { data: syncs } = await supabase
      .from("property_syncs")
      .select("*")
      .in("property_id", propertyIds);
    (syncs || []).forEach((s: any) => { syncMap[s.property_id] = s; });
  }

  return {
    ...data,
    createdAt: new Date(data.created_at),
    plan: { 
        name: userPlan?.plan || "basic",
        startedAt: userPlan?.created_at ? new Date(userPlan.created_at) : null
    },
    planId: userPlan?.plan || "basic",
    properties: (props || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        createdAt: new Date(p.created_at),
        icals: (p.property_icals || []).map((i: any) => i.url),
        sync: syncMap[p.id] ? {
          lastSyncedAt: syncMap[p.id].last_synced_at ? new Date(syncMap[p.id].last_synced_at) : null,
          feedsCount: syncMap[p.id].feeds_count || 0,
          eventsProcessed: syncMap[p.id].events_processed || 0,
          error: syncMap[p.id].error || null
        } : null
    })),
    subscription: data.subscription ? {
        ...data.subscription,
        startDate: new Date(data.subscription.start_date),
        endDate: data.subscription.end_date ? new Date(data.subscription.end_date) : null
    } : null,
    payments: (data.payments || []).map((p: any) => ({
        ...p,
        createdAt: new Date(p.created_at)
    })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
    adminNotes: (data.adminNotes || []).map((n: any) => ({
        ...n,
        createdAt: new Date(n.created_at)
    })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  const plans = plansCatalog.map(p => ({ id: p.id, name: p.title }));

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{user.email}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{user.role}</Badge>
            <Badge variant={user.status === "active" ? "success" : "destructive"}>
              {user.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <UserActions 
                userId={user.id} 
                currentStatus={user.status} 
                currentPlanId={user.planId}
                plans={plans}
            />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan & Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current Plan</div>
              <div className="text-lg font-semibold">
                {plansCatalog.find(p => p.id === user.plan?.name)?.title || user.plan?.name || "No Plan"}
              </div>
            </div>
            
            {/* Show Plan Start Date from user_plans if available, otherwise fallback to subscription */}
            {(user.plan?.startedAt || user.subscription) && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Plan Started</div>
                  <div>
                    {user.plan?.startedAt 
                        ? user.plan.startedAt.toLocaleDateString() 
                        : user.subscription?.startDate.toLocaleDateString()}
                  </div>
                </div>
            )}
            
            {user.subscription?.endDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">End Date</div>
                  <div>{user.subscription.endDate.toLocaleDateString()}</div>
                </div>
            )}

            <ChangePlanDialog userId={user.id} currentPlanId={user.planId || undefined} plans={plans} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span>{user.createdAt.toLocaleDateString()}</span>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties & Sync</CardTitle>
        </CardHeader>
        <CardContent>
          {(!user.properties || user.properties.length === 0) ? (
            <p className="text-muted-foreground">No properties found.</p>
          ) : (
            <div className="space-y-3">
              {user.properties.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-3 last:border-none">
                  <div className="space-y-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      iCal feeds: {p.icals.length}
                      {" · "}
                      Last synced: {p.sync?.lastSyncedAt ? p.sync.lastSyncedAt.toLocaleString() : "—"}
                      {" · "}
                      Events processed: {p.sync?.eventsProcessed ?? 0}
                      {p.sync?.error ? (
                        <span className="text-red-600"> {" · "}Error: {p.sync.error}</span>
                      ) : null}
                    </div>
                  </div>
                  <PropertySyncActions propertyId={p.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
            {user.payments.length === 0 ? (
                <p className="text-muted-foreground">No payments recorded.</p>
            ) : (
                <div className="space-y-2">
                    {user.payments.map((p: Payment) => (
                        <div key={p.id} className="flex justify-between border-b pb-2">
                            <div>
                                <div className="font-medium">{p.amount} {p.currency}</div>
                                <div className="text-xs text-muted-foreground">{p.mode}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm">{p.createdAt.toLocaleDateString()}</div>
                                <Badge variant="outline">{p.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Button className="mt-4" variant="secondary">Add Manual Payment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
