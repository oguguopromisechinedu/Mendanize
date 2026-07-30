import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { getPublicSession } from "@/features/authentication/server"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { z } from "@/validators"

const schema = z.object({
  toolId: z.string().trim().min(1),
  favorite: z.boolean(),
})

export async function POST(req: Request) {
  try {
    const session = await getPublicSession()
    if (!session?.user?.id) {
      return fail("UNAUTHORIZED", "Sign in to favorite tools.", 401)
    }
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid payload.", 400)
    }
    if (!isDatabaseConfigured()) return ok({ favorite: parsed.data.favorite })

    const prisma = getPrisma()
    if (parsed.data.favorite) {
      await prisma.savedContent.upsert({
        where: {
          publicUserId_entityType_entityId: {
            publicUserId: session.user.id,
            entityType: "AI_TOOL",
            entityId: parsed.data.toolId,
          },
        },
        create: {
          publicUserId: session.user.id,
          entityType: "AI_TOOL",
          entityId: parsed.data.toolId,
        },
        update: {},
      })
    } else {
      await prisma.savedContent.deleteMany({
        where: {
          publicUserId: session.user.id,
          entityType: "AI_TOOL",
          entityId: parsed.data.toolId,
        },
      })
    }
    return ok({ favorite: parsed.data.favorite })
  } catch (error) {
    return handleApiError(error)
  }
}
