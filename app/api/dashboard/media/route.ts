/**
 * Dashboard Media API â€” list compact assets for Media Picker.
 * Response: { data, error, meta }
 */
import { NextResponse } from "next/server"
import { requireEditor } from "@/features/authentication/server"
import { listAssets } from "@/services/media"

export async function GET(request: Request) {
  const session = await requireEditor()
  if (!session) {
    return NextResponse.json(
      { data: null, error: { message: "Unauthorized" }, meta: {} },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") ?? undefined
  const mimePrefix = searchParams.get("mimePrefix") ?? undefined

  const data = await listAssets({
    query,
    mimePrefix: mimePrefix || undefined,
    status: "ACTIVE",
    pageSize: 48,
  })

  return NextResponse.json({
    data,
    error: null,
    meta: { count: data.length },
  })
}
