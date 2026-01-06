
import { getUsers } from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "../users/user-actions";
import { plansCatalog } from "@/lib/plans";

export default async function RequestsPage() {
  const allUsers = await getUsers();
  const pendingUsers = allUsers.filter(u => u.status === "pending");
  const plans = plansCatalog.map(p => ({ id: p.id, name: p.title }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Access Requests</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No pending requests.
                    </TableCell>
                </TableRow>
            ) : (
                pendingUsers.map((user) => (
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
  );
}
