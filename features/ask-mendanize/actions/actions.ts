"use server";

import { revalidatePath } from "next/cache";
import { requirePublicUser } from "@/features/authentication/server";
import {
  createConversation,
  sendConversationMessage,
  submitAskFeedback,
} from "@/services/ai/ask";
import {
  createConversationSchema,
  feedbackSchema,
  sendMessageSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";

function revalidateAsk() {
  revalidatePath("/ask");
}

export async function createAskConversationAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser();
  if (!session?.user?.id) return { ok: false, message: "Sign in required" };
  const parsed = createConversationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  try {
    const conversation = await createConversation({
      userId: session.user.id,
      ...parsed.data,
    });
    revalidateAsk();
    return { ok: true, message: "Conversation created", data: conversation };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create conversation",
    };
  }
}

export async function sendAskMessageAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser();
  if (!session?.user?.id) return { ok: false, message: "Sign in required" };
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  try {
    const conversation = await sendConversationMessage({
      userId: session.user.id,
      conversationId: parsed.data.conversationId,
      content: parsed.data.content,
    });
    revalidateAsk();
    return { ok: true, message: "Message sent", data: conversation };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not send message",
    };
  }
}

export async function submitAskFeedbackAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser();
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await submitAskFeedback({
    userId: session?.user?.id,
    ...parsed.data,
  });
  return { ok: true, message: "Thanks for the feedback" };
}
