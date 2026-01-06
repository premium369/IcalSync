
import { getUpgradeRequests, getUsers } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestActions } from "./request-actions";
import { UserActions } from "../users/user-actions";
import { plansCatalog } from "@/lib/plans";

export default async function RequestsPage() {
  const [upgradeRequests, allUsers] = await Promise.all([
    getUpgradeRequests(),
    getUsers()
  ]);

  const pendingUsers = allUsers.filter((u: any) => u.status === "pending");
  const plans = plansCatalog.map(p => ({ id: p.id, name: p.title }));

  return (
    <div className="space-y-8">
      
      {/* Upgrade Requests Section */}
      <div className="space-y-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Upgrade Requests</h2>
            <p className="text-muted-foreground">Review and process plan upgrade requests.</p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Desired</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-[300px]">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upgradeRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No upgrade requests.
                  </TableCell>
                </TableRow>
              ) : (
                upgradeRequests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{req.user_id.substring(0, 8)}...</TableCell>
                    <TableCell className="capitalize">{req.desired_plan}</TableCell>
                    <TableCell>{req.contact_email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.message}</TableCell>
                    <TableCell>
                      <Badge variant={req.status === "approved" ? "success" : req.status === "denied" ? "destructive" : "secondary"}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RequestActions request={req} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending Users Section */}
      <div className="space-y-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">New Account Requests</h2>
            <p className="text-muted-foreground">New users waiting for approval.</p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No pending new accounts.
                      </TableCell>
                  </TableRow>
              ) : (
                  pendingUsers.map((user: any) => (
                  <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                      <Badge variant="warning">
                          {user.status}
                      </Badge>
                      </TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <UserActions 
                            userId={user.id} 
                            currentStatus={user.status} 
                            currentPlanId={user.plan?.name}
                            plans={plans}
                        />
                      </TableCell>
                  </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}
