
import { getUsers, updateUserStatus } from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { UserActions } from "./user-actions";
import { plansCatalog } from "@/lib/plans";

export default async function UsersPage() {
  const users = await getUsers();
  const plans = plansCatalog.map(p => ({ id: p.id, name: p.title }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Button>Add User</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Plan Started</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                    <Link href={`/boss/users/${user.id}`} className="hover:underline">
                        {user.email}
                    </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "active"
                        ? "success"
                        : user.status === "pending"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                    {plansCatalog.find(p => p.id === user.plan?.name)?.title || user.plan?.name || "None"}
                </TableCell>
                <TableCell>
                    {user.plan?.startedAt ? user.plan.startedAt.toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{user.updatedAt ? user.updatedAt.toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <UserActions 
                    userId={user.id} 
                    currentStatus={user.status} 
                    currentPlanId={user.plan?.name}
                    plans={plans}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
