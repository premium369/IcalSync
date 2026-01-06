"use client";

import { Button } from "@/components/ui/button";
import { approveUpgradeRequest, denyUpgradeRequest, markRequestReviewed } from "@/actions/admin";
import { useTransition } from "react";
import { Check, X, Eye } from "lucide-react";

export function RequestActions({ request }: { request: any }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (confirm(`Approve upgrade to ${request.desired_plan}?`)) {
      startTransition(async () => {
        try {
          await approveUpgradeRequest(request.id, request.user_id, request.desired_plan);
        } catch (e) {
          alert("Failed to approve request");
        }
      });
    }
  };

  const handleDeny = () => {
    if (confirm("Deny this request?")) {
      startTransition(async () => {
        try {
          await denyUpgradeRequest(request.id);
        } catch (e) {
          alert("Failed to deny request");
        }
      });
    }
  };

  const handleReview = () => {
    startTransition(async () => {
      try {
        await markRequestReviewed(request.id);
      } catch (e) {
        alert("Failed to mark as reviewed");
      }
    });
  };

  if (request.status !== "open") {
      return <span className="text-muted-foreground text-sm capitalize">{request.status}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="default" 
        className="bg-green-600 hover:bg-green-700 h-8 px-2"
        onClick={handleApprove}
        disabled={isPending}
      >
        <Check className="w-4 h-4 mr-1" />
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="destructive"
        className="h-8 px-2"
        onClick={handleDeny}
        disabled={isPending}
      >
        <X className="w-4 h-4 mr-1" />
        Deny
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="h-8 px-2"
        onClick={handleReview}
        disabled={isPending}
      >
        <Eye className="w-4 h-4 mr-1" />
        Mark Reviewed
      </Button>
    </div>
  );
}
