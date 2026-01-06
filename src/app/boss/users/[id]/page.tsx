
import { createServiceClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserStatusAction } from "../user-actions";
import { ChangePlanDialog } from "@/components/change-plan-dialog";

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
    .select("plan")
    .eq("user_id", id)
    .single();

  return {
    ...data,
    createdAt: new Date(data.created_at),
    plan: { name: userPlan?.plan || "basic" },
    planId: userPlan?.plan || "basic",
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

async function getPlans() {
  // Return hardcoded plans
  return [
      { id: "basic", name: "Starter" },
      { id: "super_host", name: "Super Host" },
      { id: "custom", name: "Custom" }
  ];
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, plans] = await Promise.all([getUser(id), getPlans()]);

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
            <UserStatusAction userId={user.id} currentStatus={user.status} />
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
              <div className="text-lg font-semibold">{user.plan?.name || "No Plan"}</div>
            </div>
            {user.subscription && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                  <div>{user.subscription.startDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">End Date</div>
                  <div>{user.subscription.endDate?.toLocaleDateString() || "N/A"}</div>
                </div>
              </>
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
