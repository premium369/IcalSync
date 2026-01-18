
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { plansCatalog } from "@/lib/plans";

export default async function PlansPage() {
  const plans = plansCatalog;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plan Catalog</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of available plans and their limits.</p>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead>Support</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.title}</TableCell>
                <TableCell className="whitespace-nowrap">{plan.price}</TableCell>
                <TableCell>{plan.propertyLimitLabel}</TableCell>
                <TableCell>{plan.support}</TableCell>
                <TableCell>
                    <ul className="list-disc list-inside text-xs text-muted-foreground">
                        {plan.features.map((f, i) => (
                            <li key={i}>{f}</li>
                        ))}
                    </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
