import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  published: "success",
  draft: "secondary",
  review: "warning",
  scheduled: "outline",
  connected: "success",
  disconnected: "destructive",
  active: "success",
  hidden: "secondary",
  archived: "outline",
  completed: "success",
  accepted: "success",
  failed: "destructive",
  running: "warning",
  pending: "secondary",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = status.toLowerCase()
  return (
    <Badge
      variant={STATUS_VARIANT[key] ?? "outline"}
      className={cn("capitalize", className)}
    >
      {status}
    </Badge>
  )
}
