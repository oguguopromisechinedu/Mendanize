"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setAnalyticsInstrumentationAction } from "../actions/actions";

export function InstrumentationToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      size="sm"
      variant={enabled ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setAnalyticsInstrumentationAction(!enabled);
          if (!res.ok) toast.error(res.message);
          else {
            toast.success(res.message);
            router.refresh();
          }
        })
      }
    >
      {enabled ? "Disable instrumentation" : "Enable instrumentation"}
    </Button>
  );
}
