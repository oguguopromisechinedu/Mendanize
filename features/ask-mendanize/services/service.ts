import {
  getAskDashboard,
  askTier1,
  type AskTier1Request,
} from "@/services/ai/ask";

export async function loadAskDashboard(input: {
  userId: string;
  conversationId?: string | null;
  handoffId?: string | null;
}) {
  return getAskDashboard(input);
}

export async function runTier1Ask(input: AskTier1Request) {
  return askTier1(input);
}