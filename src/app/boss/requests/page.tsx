
import { getUpgradeRequests } from "@/actions/admin";
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

export default async function RequestsPage() {
  const upgradeRequests = await getUpgradeRequests();

  return (
    <div className="space-y-8">
      
      <div className="space-y-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Upgrade Requests</h2>
            <p className="text-sm text-muted-foreground mt-1">Review and process user plan upgrade requests.</p>
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

    </div>
  );
}
