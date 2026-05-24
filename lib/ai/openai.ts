import OpenAI from "openai";
import { DEFAULT_MODEL } from "./models";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export type ChatMessageInput = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function createChatCompletion(params: {
  messages: ChatMessageInput[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const openai = getOpenAIClient();
  return openai.chat.completions.create({
    model: params.model ?? DEFAULT_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 2000,
  });
}

export async function createChatStream(params: {
  messages: ChatMessageInput[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const openai = getOpenAIClient();
  return openai.chat.completions.create({
    model: params.model ?? DEFAULT_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 2000,
    stream: true,
  });
}
