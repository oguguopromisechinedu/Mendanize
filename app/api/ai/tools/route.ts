import { getSession } from "@/features/authentication/server";
import { createChatCompletion } from "@/lib/ai/openai";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { rateLimit } from "@/lib/rate-limit";
import { toolGenerateSchema } from "@/lib/validations/ai";
import { getToolById } from "@/lib/tools/registry";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limitKey = `tool:${userId ?? ip}`;

    const { success, remaining } = await rateLimit(limitKey);
    if (!success) {
      return Response.json(
        { error: "Rate limit exceeded.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = toolGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { toolId, values, model } = parsed.data;
    const tool = getToolById(toolId);
    if (!tool) {
      return Response.json({ error: "Tool not found" }, { status: 404 });
    }

    const required = tool.fields.filter((f) => f.required);
    for (const field of required) {
      if (!values[field.name]?.trim()) {
        return Response.json(
          { error: `${field.label} is required`, code: "MISSING_FIELD" },
          { status: 400 }
        );
      }
    }

    const userPrompt = tool.buildPrompt(values);
    const completion = await createChatCompletion({
      model: model ?? tool.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: tool.systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      return Response.json({ error: "Empty response from AI" }, { status: 502 });
    }

    if (userId && isDatabaseConfigured()) {
      await getPrisma().generation.create({
        data: {
          userId,
          toolId,
          prompt: userPrompt,
          output: result,
          model: model ?? DEFAULT_MODEL,
          status: "COMPLETED",
        },
      });
    }

    return Response.json(
      { result },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return Response.json({ error: message, code: "TOOL_FAILED" }, { status: 500 });
  }
}
