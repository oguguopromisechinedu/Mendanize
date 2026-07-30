import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { requireAdmin } from "@/features/authentication/server"
import { upsertGlossaryTerm } from "@/services/platform"
import { z } from "@/validators"

const schema = z.object({
  id: z.string().optional(),
  term: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(120).optional(),
  definition: z.string().trim().min(1).max(10000),
  category: z.string().trim().max(120).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) return fail("UNAUTHORIZED", "Admin required.", 401)
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid glossary payload.", 400)
    }
    const row = await upsertGlossaryTerm(parsed.data)
    return ok(row)
  } catch (error) {
    return handleApiError(error)
  }
}
