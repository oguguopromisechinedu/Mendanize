"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import {
  publishHomepage,
  updateHomepage,
} from "@/services/content/homepage"
import type { HomepageAdminRecord } from "@/services/content/types"
import { homepageWriteSchema } from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateHomepage() {
  revalidatePath("/dashboard/homepage")
  revalidatePath("/")
}

export async function updateHomepageAction(
  input: unknown
): Promise<ActionResult<HomepageAdminRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = homepageWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  try {
    const data = await updateHomepage(parsed.data)
    revalidateHomepage()
    return { ok: true, message: "Homepage saved", data }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to save homepage",
    }
  }
}

export async function publishHomepageAction(): Promise<
  ActionResult<HomepageAdminRecord>
> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  try {
    const data = await publishHomepage()
    revalidateHomepage()
    return { ok: true, message: "Homepage published", data }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to publish homepage",
    }
  }
}
