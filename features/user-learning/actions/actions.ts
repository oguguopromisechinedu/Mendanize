"use server";

import { revalidatePath } from "next/cache";
import { requirePublicUser } from "@/features/authentication/server";
import {
  deleteLearningGoal,
  saveContent,
  setInterest,
  unsaveContent,
  updateUserPreferences,
  upsertLearningGoal,
} from "@/services/learning";
import {
  startLearnerProject,
  updateLearnerProjectStatus,
  createCommunityPost,
  markDailyActivity,
} from "@/services/ecosystem";
import { AppError } from "@/lib/api/errors";
import {
  interestSchema,
  learningGoalSchema,
  preferencesSchema,
  saveContentSchema,
  unsaveContentSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";
import { LEARNING_NAV } from "../constants/constants";

function revalidateLearning() {
  for (const item of LEARNING_NAV) {
    revalidatePath(item.href);
  }
}

async function gate(): Promise<{ userId: string } | ActionResult> {
  const session = await requirePublicUser();
  if (!session?.user?.id) return { ok: false, message: "Sign in required" };
  return { userId: session.user.id };
}

export async function saveContentAction(input: unknown): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const parsed = saveContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid save request" };
  try {
    await saveContent({ userId: auth.userId, ...parsed.data });
    revalidateLearning();
    return { ok: true, message: "Saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not save",
    };
  }
}

export async function unsaveContentAction(input: unknown): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const parsed = unsaveContentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid remove request" };
  try {
    await unsaveContent({ userId: auth.userId, ...parsed.data });
    revalidateLearning();
    return { ok: true, message: "Removed from saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not remove",
    };
  }
}

export async function setInterestAction(input: unknown): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const parsed = interestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid interest" };
  try {
    await setInterest({ userId: auth.userId, ...parsed.data });
    revalidateLearning();
    return {
      ok: true,
      message: parsed.data.enabled ? "Interest added" : "Interest removed",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not update interest",
    };
  }
}

export async function savePreferencesAction(
  input: unknown,
): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid preferences" };
  try {
    await updateUserPreferences(auth.userId, parsed.data);
    revalidateLearning();
    return { ok: true, message: "Preferences saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not save preferences",
    };
  }
}

export async function saveGoalAction(input: unknown): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const parsed = learningGoalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid goal" };
  try {
    await upsertLearningGoal({ userId: auth.userId, ...parsed.data });
    revalidateLearning();
    return { ok: true, message: "Goal saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not save goal",
    };
  }
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  try {
    await deleteLearningGoal(auth.userId, goalId);
    revalidateLearning();
    return { ok: true, message: "Goal removed" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not remove goal",
    };
  }
}

// ─── Ecosystem learner actions ────────────────────────────────────────────────

export async function markLessonCompleteAction(
  _lessonId: string,
): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  try {
    await markDailyActivity(auth.userId);
    revalidatePath(`/account`);
    revalidatePath(`/account/continue`);
    return { ok: true, message: "Lesson marked complete" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not mark lesson complete",
    };
  }
}

export async function startLearnerProjectAction(
  templateId: string,
): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  try {
    await startLearnerProject(auth.userId, templateId);
    revalidatePath("/account/projects");
    return { ok: true, message: "Project started" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not start project",
    };
  }
}

export async function updateProjectStatusAction(
  projectId: string,
  status: string,
): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    return { ok: false, message: "Invalid project status" };
  }
  try {
    await updateLearnerProjectStatus(auth.userId, projectId, {
      status: status as "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED",
    });
    revalidatePath("/account/projects");
    return { ok: true, message: "Project updated" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not update project",
    };
  }
}

export async function createCommunityPostAction(
  body: string,
): Promise<ActionResult> {
  const auth = await gate();
  if ("ok" in auth) return auth;
  if (!body?.trim()) return { ok: false, message: "Post body is required" };
  if (body.length > 2000) return { ok: false, message: "Post too long (max 2000 characters)" };
  try {
    await createCommunityPost({
      publicUserId: auth.userId,
      entityType: "GUIDE",
      entityId: "community",
      body: body.trim(),
    });
    revalidatePath("/account/community");
    return { ok: true, message: "Post submitted for review" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Could not post",
    };
  }
}
