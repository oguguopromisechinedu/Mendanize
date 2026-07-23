"use server"

import { revalidatePath } from "next/cache"
import { requirePublicUser } from "@/features/authentication/server"
import {
  deletePublicUserAccount,
  exportPublicUserData,
  saveCookieConsent,
} from "@/services/privacy/service"

export async function exportMyDataAction() {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false as const, message: "Unauthorized" }
  const data = await exportPublicUserData(session.user.id)
  return { ok: true as const, data }
}

export async function deleteMyAccountAction() {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false as const, message: "Unauthorized" }
  await deletePublicUserAccount(session.user.id)
  revalidatePath("/account")
  return { ok: true as const }
}

export async function saveConsentAction(input: {
  analytics: boolean
  marketing: boolean
}) {
  let publicUserId: string | null = null
  try {
    const session = await requirePublicUser()
    publicUserId = session?.user?.id ?? null
  } catch {
    publicUserId = null
  }
  await saveCookieConsent({
    publicUserId,
    analytics: input.analytics,
    marketing: input.marketing,
  })
  return { ok: true as const }
}
