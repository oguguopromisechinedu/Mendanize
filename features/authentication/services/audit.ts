import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

/** Persist admin authorization / mutation audit events (MES-030). */
export async function logAuthorization(params: {
  adminId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  if (!isDatabaseConfigured()) return;

  try {
    await getPrisma().authorizationLog.create({
      data: {
        adminId: params.adminId ?? undefined,
        actorEmail: params.actorEmail ?? undefined,
        action: params.action,
        entityType: params.entityType ?? undefined,
        entityId: params.entityId ?? undefined,
        summary: params.summary,
        metadataJson: params.metadata
          ? JSON.stringify(params.metadata)
          : undefined,
        ipAddress: params.ipAddress ?? undefined,
      },
    });
  } catch (error) {
    console.error("[auth] authorization log failed:", error);
  }
}
