import { getSession } from "@/features/authentication/server";
import { createChatStream } from "@/lib/ai/openai";
import { systemPrompts } from "@/lib/ai/prompts";
import { rateLimit } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/validations/ai";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.id ?? "anonymous";
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limitKey = `chat:${userId}:${ip}`;

    const { success, remaining } = await rateLimit(limitKey);
    if (!success) {
      return Response.json(
        { error: "Rate limit exceeded. Try again shortly.", code: "RATE_LIMITED" },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, model } = parsed.data;
    const stream = await createChatStream({
      model: model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompts.workspace },
        ...messages,
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return Response.json({ error: message, code: "CHAT_FAILED" }, { status });
  }
}
