"use client";

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
import { updateUserStatus } from "@/actions/admin";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChangePlanDialog } from "@/components/change-plan-dialog";

interface Plan {
    id: string;
    name: string;
}

export function UserActions({ userId, currentStatus, currentPlanId, plans }: { userId: string, currentStatus: string, currentPlanId?: string, plans: Plan[] }) {
  const [isPending, startTransition] = useTransition();
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  const handleStatusChange = (status: "active" | "suspended" | "rejected") => {
    if (confirm(`Are you sure you want to mark this user as ${status}?`)) {
      startTransition(async () => {
        try {
          await updateUserStatus(userId, status);
        } catch (e) {
          alert("Failed to update status");
        }
      });
    }
  };

  return (
    <>
        <ChangePlanDialog 
            userId={userId} 
            currentPlanId={currentPlanId} 
            plans={plans} 
            open={showPlanDialog} 
            onOpenChange={setShowPlanDialog} 
        />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setShowPlanDialog(true)}>
                Change Plan
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/boss/users/${userId}`} className="cursor-pointer">
                    View Profile
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
            Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusChange("active")}>
            Set Status: Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("suspended")}>
            Set Status: Suspended
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
            Set Status: Rejected
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </>
  );
}
