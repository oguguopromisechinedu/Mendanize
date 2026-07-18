import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="Nothing here" description="Try another filter." />
    )
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
    expect(screen.getByText("Try another filter.")).toBeInTheDocument()
  })
})

describe("ErrorState", () => {
  it("renders retry affordance when onRetry is provided", () => {
    render(
      <ErrorState
        title="Failed"
        description="Broken"
        onRetry={() => undefined}
      />
    )
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument()
  })
})
