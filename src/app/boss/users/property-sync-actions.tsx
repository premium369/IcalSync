"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function PropertySyncActions({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/sync-ical?propertyId=${propertyId}`, { method: "GET", cache: "no-store" });
        if (!res.ok) {
          const t = await res.text();
          alert(t || "Failed to start sync");
          return;
        }
        router.refresh();
      } catch {
        alert("Failed to start sync");
      }
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleSync} disabled={isPending} className="h-8 px-2">
      <RefreshCcw className="w-4 h-4 mr-1" />
      Refresh Now
    </Button>
  );
}
