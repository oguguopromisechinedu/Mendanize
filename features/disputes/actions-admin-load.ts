"use server"

import { requireEditor } from "@/features/authentication/server"
import { getDisputeDetail, type DisputeDetail } from "@/services/disputes"

export async function loadDisputeDetailAction(
  disputeId: string,
): Promise<DisputeDetail> {
  const session = await requireEditor()
  if (!session?.admin?.id) throw new Error("Admin required")
  return getDisputeDetail(disputeId)
}
