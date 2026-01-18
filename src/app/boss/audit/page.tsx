
import { createServiceClient } from "@/lib/supabase-server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getLogs() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return data.map((l: any) => ({
      id: l.id,
      action: l.action,
      adminId: l.admin_id,
      targetId: l.target_id,
      details: l.details,
      createdAt: new Date(l.created_at)
  }));
}

export default async function AuditPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">Recent admin actions for security and troubleshooting.</p>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Admin ID</TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {log.createdAt.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="font-mono text-xs">{log.adminId}</TableCell>
                <TableCell className="font-mono text-xs">{log.targetId || "-"}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
