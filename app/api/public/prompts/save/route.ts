import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { getPublicSession } from "@/features/authentication/server"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { z } from "@/validators"

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
})

export async function POST(req: Request) {
  try {
    const session = await getPublicSession()
    if (!session?.user?.id) {
      return fail("UNAUTHORIZED", "Sign in to save prompts.", 401)
    }
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid prompt payload.", 400)
    }
    if (!isDatabaseConfigured()) {
      return ok({ saved: true })
    }
    await getPrisma().promptLibraryEntry.create({
      data: {
        publicUserId: session.user.id,
        title: parsed.data.title,
        body: parsed.data.body,
        tags: [],
      },
    })
    return ok({ saved: true })
  } catch (error) {
    return handleApiError(error)
  }
}
