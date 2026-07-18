import { cn } from "@/lib/utils"

function Container({
  className,
  size = "xl",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}) {
  const max =
    size === "sm"
      ? "max-w-[var(--container-sm)]"
      : size === "md"
        ? "max-w-[var(--container-md)]"
        : size === "lg"
          ? "max-w-[var(--container-lg)]"
          : size === "2xl"
            ? "max-w-[var(--container-2xl)]"
            : "max-w-[var(--container-xl)]"

  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full px-[var(--space-6)]",
        max,
        className
      )}
      {...props}
    />
  )
}

function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn("section-y", className)}
      {...props}
    />
  )
}

export { Container, Section }
