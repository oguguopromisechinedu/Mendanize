"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CommunitySearchForm({
  initialQuery = "",
}: {
  initialQuery?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const q = query.trim()
        router.push(
          q
            ? `/community/search?q=${encodeURIComponent(q)}`
            : "/community/search",
        )
      }}
    >
      <label className="sr-only" htmlFor="community-search">
        Search community
      </label>
      <input
        id="community-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search discussions, groups, teams, projects…"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
      />
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  )
}
