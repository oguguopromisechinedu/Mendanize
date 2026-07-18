import OpenAI from "openai";

import { handleApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { clientKeyFromRequest } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "generate"), 10);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      logger.error("OPENAI_API_KEY missing for /api/generate");
      return Response.json(
        {
          error:
            "OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";

    if (!topic) {
      return Response.json(
        {
          error: "Topic is required and must be a non-empty string.",
          code: "MISSING_TOPIC",
        },
        { status: 400 }
      );
    }

    const tone =
      typeof body.tone === "string" && body.tone.trim()
        ? body.tone.trim()
        : "Professional";
    const audience =
      typeof body.audience === "string" && body.audience.trim()
        ? body.audience.trim()
        : "Beginners";
    const length =
      typeof body.length === "string" && body.length.trim()
        ? body.length.trim()
        : "medium";
    const keywords =
      typeof body.keywords === "string" && body.keywords.trim()
        ? body.keywords.trim()
        : "";
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : "";

    logger.info("Generate blog request", {
      topicLength: topic.length,
      tone,
      audience,
      length,
      hasKeywords: Boolean(keywords),
    });

    const openai = new OpenAI({ apiKey });

    const promptSections = [
      `Topic: ${topic}`,
      `Tone: ${tone}`,
      `Target audience: ${audience}`,
      `Article length: ${length}`,
      keywords ? `SEO keywords: ${keywords}` : "",
      notes ? `Additional context: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert blog writer. Write engaging, SEO-friendly blog posts in markdown format.",
        },
        {
          role: "user",
          content: `Write a detailed SEO-friendly blog post in markdown.

${promptSections}

Requirements:
- Include an engaging H1 title
- Add an introduction section
- Use multiple H2 and H3 headings for structure
- Add a conclusion with a strong call to action
- Include practical examples, insights, and SEO best practices
- Format everything as valid markdown`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      logger.error("OpenAI returned empty content for /api/generate");
      return Response.json(
        {
          error: "OpenAI returned no content. Please try again.",
          code: "EMPTY_RESPONSE",
        },
        { status: 502 }
      );
    }

    return Response.json({ result });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      logger.error("OpenAI API error on /api/generate", {
        status: error.status,
        type: error.error?.type,
      });

      if (error.status === 401) {
        return Response.json(
          {
            error: "Authentication failed. Please check your OpenAI API key.",
            code: "AUTH_FAILED",
          },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return Response.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMITED",
          },
          { status: 429 }
        );
      }
      if (error.status === 404) {
        return Response.json(
          {
            error: "Model not found. Please contact support.",
            code: "MODEL_NOT_FOUND",
          },
          { status: 404 }
        );
      }
    }

    return handleApiError(error);
  }
}
