import { cn } from "@/lib/utils"

function Progress({
  value = 0,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-[var(--motion-base)] ease-[var(--ease-out)]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
