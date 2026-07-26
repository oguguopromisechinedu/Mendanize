"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/features/authentication/server";
import { AppError } from "@/lib/api/errors";
import {
  adminCreatePromptPack,
  adminUpdatePromptPack,
  adminPublishPromptPack,
  adminArchivePromptPack,
  adminDeletePromptPack,
  adminCreatePromptPackItem,
  adminUpdatePromptPackItem,
  adminDeletePromptPackItem,
  adminCreateProjectTemplate,
  adminUpdateProjectTemplate,
  adminPublishProjectTemplate,
  adminDeleteProjectTemplate,
  adminCreateCertificateTemplate,
  adminUpdateCertificateTemplate,
  adminPublishCertificateTemplate,
  adminDeleteCertificateTemplate,
  adminUpdateFeaturedSetting,
  adminCreateWorkspacePreset,
  adminUpdateWorkspacePreset,
  adminPublishWorkspacePreset,
  adminDeleteWorkspacePreset,
} from "@/services/ecosystem";
import type { ActionResult } from "../types/types";
import {
  promptPackWriteSchema,
  promptPackItemWriteSchema,
  idSchema,
  projectTemplateWriteSchema,
  certificateTemplateWriteSchema,
  featuredSettingWriteSchema,
  workspacePresetWriteSchema,
} from "../validators/schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function gateContent(): Promise<{ adminId: string } | ActionResult> {
  const session = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!session?.admin?.id) return { ok: false, message: "Permission required" };
  return { adminId: session.admin.id };
}

function revalidateEcosystem() {
  revalidatePath("/dashboard/prompt-library");
  revalidatePath("/dashboard/project-templates");
  revalidatePath("/dashboard/certificates");
  revalidatePath("/dashboard/featured-learning");
  revalidatePath("/dashboard/workspace-presets");
  revalidatePath("/account/prompts");
  revalidatePath("/account/projects");
  revalidatePath("/account/certificates");
  revalidatePath("/account/workspace");
}

// ─── Prompt Packs ─────────────────────────────────────────────────────────────

export async function createPromptPackAction(input: unknown): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = promptPackWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminCreatePromptPack(parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Prompt pack created" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not create pack" };
  }
}

export async function updatePromptPackAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = promptPackWriteSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdatePromptPack(id, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Prompt pack updated" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not update pack" };
  }
}

export async function publishPromptPackAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminPublishPromptPack(id);
    revalidateEcosystem();
    return { ok: true, message: "Prompt pack published" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not publish" };
  }
}

export async function archivePromptPackAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminArchivePromptPack(id);
    revalidateEcosystem();
    return { ok: true, message: "Prompt pack archived" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not archive" };
  }
}

export async function deletePromptPackAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminDeletePromptPack(id);
    revalidateEcosystem();
    return { ok: true, message: "Prompt pack deleted" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not delete pack" };
  }
}

export async function createPromptPackItemAction(
  packId: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = promptPackItemWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminCreatePromptPackItem(packId, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Prompt added" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not add prompt" };
  }
}

export async function updatePromptPackItemAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = promptPackItemWriteSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdatePromptPackItem(id, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Prompt updated" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not update prompt" };
  }
}

export async function deletePromptPackItemAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminDeletePromptPackItem(id);
    revalidateEcosystem();
    return { ok: true, message: "Prompt removed" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not remove prompt" };
  }
}

// ─── Project Templates ────────────────────────────────────────────────────────

export async function createProjectTemplateAction(input: unknown): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = projectTemplateWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminCreateProjectTemplate(parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Project template created" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not create template" };
  }
}

export async function updateProjectTemplateAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = projectTemplateWriteSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdateProjectTemplate(id, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Project template updated" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not update template" };
  }
}

export async function publishProjectTemplateAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminPublishProjectTemplate(id);
    revalidateEcosystem();
    return { ok: true, message: "Project template published" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not publish" };
  }
}

export async function deleteProjectTemplateAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminDeleteProjectTemplate(id);
    revalidateEcosystem();
    return { ok: true, message: "Project template deleted" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not delete template" };
  }
}

// ─── Certificate Templates ────────────────────────────────────────────────────

export async function createCertificateTemplateAction(input: unknown): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = certificateTemplateWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminCreateCertificateTemplate(parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Certificate template created" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not create template" };
  }
}

export async function updateCertificateTemplateAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = certificateTemplateWriteSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdateCertificateTemplate(id, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Certificate template updated" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not update template" };
  }
}

export async function publishCertificateTemplateAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminPublishCertificateTemplate(id);
    revalidateEcosystem();
    return { ok: true, message: "Certificate template published" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not publish" };
  }
}

export async function deleteCertificateTemplateAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminDeleteCertificateTemplate(id);
    revalidateEcosystem();
    return { ok: true, message: "Certificate template deleted" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not delete template" };
  }
}

// ─── Featured Learning ─────────────────────────────────────────────────────────

export async function updateFeaturedSettingAction(input: unknown): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = featuredSettingWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdateFeaturedSetting(parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Featured setting saved" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not save setting" };
  }
}

// ─── Workspace Presets ────────────────────────────────────────────────────────

export async function createWorkspacePresetAction(input: unknown): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = workspacePresetWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminCreateWorkspacePreset(parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Workspace preset created" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not create preset" };
  }
}

export async function updateWorkspacePresetAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  const parsed = workspacePresetWriteSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await adminUpdateWorkspacePreset(id, parsed.data);
    revalidateEcosystem();
    return { ok: true, message: "Workspace preset updated" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not update preset" };
  }
}

export async function publishWorkspacePresetAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminPublishWorkspacePreset(id);
    revalidateEcosystem();
    return { ok: true, message: "Workspace preset published" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not publish" };
  }
}

export async function deleteWorkspacePresetAction(id: string): Promise<ActionResult> {
  const auth = await gateContent();
  if ("ok" in auth) return auth;
  try {
    await adminDeleteWorkspacePreset(id);
    revalidateEcosystem();
    return { ok: true, message: "Workspace preset deleted" };
  } catch (err) {
    return { ok: false, message: err instanceof AppError ? err.message : "Could not delete preset" };
  }
}
