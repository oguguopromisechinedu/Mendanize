import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  className?: string
}

function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  const canPrev = page > 1
  const canNext = page < pageCount

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange?.(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange?.(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}

export { Pagination }
