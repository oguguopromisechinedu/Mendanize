import { cn } from "@/lib/utils"

function Spinner({
  className,
  size = "md",
  ...props
}: React.ComponentProps<"span"> & { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "sm" ? "size-3.5 border-2" : size === "lg" ? "size-8 border-[3px]" : "size-5 border-2"

  return (
    <span
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn(
        "inline-block animate-spin rounded-full border-primary border-r-transparent",
        sizeClass,
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
