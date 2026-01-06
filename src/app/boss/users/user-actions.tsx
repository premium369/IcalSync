
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
import { useTransition } from "react";

export function UserStatusAction({ userId, currentStatus }: { userId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange("active")}>
          Approve / Activate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("suspended")}>
          Suspend
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
