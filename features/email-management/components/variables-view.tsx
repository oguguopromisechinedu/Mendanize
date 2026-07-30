"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { createEmsVariableAction } from "../actions"
import { EmsNav } from "./ems-nav"

export function EmsVariablesView({
  variables,
}: {
  variables: Array<{
    id: string
    key: string
    label: string
    description: string | null
    sampleValue: string | null
    builtin: boolean
  }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [key, setKey] = useState("")
  const [label, setLabel] = useState("")
  const [sample, setSample] = useState("")

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email variables"
        description="Built-in and custom {{keys}} for templates and preview fixtures."
      />
      <EmsNav />
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          className="h-9 w-36 rounded-lg border border-input bg-transparent px-3 font-mono text-sm"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="custom_key"
        />
        <input
          className="h-9 min-w-[140px] flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
        />
        <input
          className="h-9 min-w-[120px] rounded-lg border border-input bg-transparent px-3 text-sm"
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          placeholder="Sample"
        />
        <Button
          size="sm"
          disabled={pending || !key.trim() || !label.trim()}
          onClick={() =>
            start(async () => {
              const res = await createEmsVariableAction({
                key,
                label,
                sampleValue: sample || null,
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setKey("")
                setLabel("")
                setSample("")
                router.refresh()
              }
            })
          }
        >
          Add
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {variables.map((v) => (
          <li key={v.id} className="px-3 py-2 text-sm">
            <div className="font-mono text-xs">
              {`{{${v.key}}}`}
              {v.builtin ? (
                <span className="ml-2 text-muted-foreground">built-in</span>
              ) : null}
            </div>
            <div className="text-muted-foreground">
              {v.label}
              {v.sampleValue ? ` · sample: ${v.sampleValue}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
