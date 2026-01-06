
import { createServiceClient } from "@/lib/supabase-server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddPaymentDialog } from "@/components/add-payment-dialog";

interface PaymentWithUser {
  id: string;
  amount: number;
  currency: string;
  mode: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  user: {
    email: string | null;
  } | null;
}

async function getPayments() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, user:users(email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching payments:", error);
    return [];
  }

  return data.map((p: any) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      mode: p.mode,
      status: p.status,
      notes: p.notes,
      createdAt: new Date(p.created_at),
      user: p.user ? { email: p.user.email } : null
  }));
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <AddPaymentDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment: PaymentWithUser) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{payment.user?.email || "Unknown"}</TableCell>
                <TableCell>{payment.amount} {payment.currency}</TableCell>
                <TableCell>{payment.mode}</TableCell>
                <TableCell>
                    <Badge variant="outline">{payment.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{payment.notes}</TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
