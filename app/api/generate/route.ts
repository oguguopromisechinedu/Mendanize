import OpenAI from "openai";

export async function POST(req: Request) {
  // Validate API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("ENV KEY:", apiKey ? apiKey.replace(/^(.{8}).+$/, '$1...') : apiKey);

  if (!apiKey || apiKey.trim() === "") {
    console.error(
      "[API Route] CRITICAL: OPENAI_API_KEY is not configured in environment variables"
    );
    return Response.json(
      {
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.",
        code: "MISSING_API_KEY",
      },
      { status: 500 }
    );
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[API Route] JSON parse error:", parseError);
      return Response.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    // Validate topic parameter
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";

    if (!topic) {
      return Response.json(
        { error: "Topic is required and must be a non-empty string.", code: "MISSING_TOPIC" },
        { status: 400 }
      );
    }

    // Optional parameters with defaults
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

    console.log(
      `[API Route] Generating blog post - Topic: "${topic}", Tone: "${tone}", Audience: "${audience}", Length: "${length}", Keywords: "${keywords}"`
    );

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Call OpenAI API with valid model
    console.log("[API Route] Calling OpenAI API with model: gpt-4o-mini");
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

    // Extract generated content
    const result = completion.choices[0]?.message?.content;

    if (!result) {
      console.error("[API Route] OpenAI returned empty content");
      return Response.json(
        {
          error: "OpenAI returned no content. Please try again.",
          code: "EMPTY_RESPONSE",
        },
        { status: 502 }
      );
    }

    console.log(
      `[API Route] Successfully generated content (${result.length} characters)`
    );
    return Response.json({ result });
  } catch (error) {
    // Detailed error logging for debugging
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorCode =
      error instanceof OpenAI.APIError ? error.status : "UNKNOWN_ERROR";

    console.error("[API Route] Error generating content:");
    console.error(
      `  Error Type: ${error instanceof OpenAI.APIError ? "OpenAI API Error" : "Unknown Error"}`
    );
    console.error(`  Error Code: ${errorCode}`);
    console.error(`  Error Message: ${errorMessage}`);

    // Return appropriate error response
    if (error instanceof OpenAI.APIError) {
      console.error(
        `  OpenAI Status: ${error.status} - ${error.error?.type || "Unknown"}`
      );

      // Specific handling for authentication errors
      if (error.status === 401) {
        return Response.json(
          {
            error: "Authentication failed. Please check your OpenAI API key.",
            code: "AUTH_FAILED",
          },
          { status: 401 }
        );
      }

      // Specific handling for rate limits
      if (error.status === 429) {
        return Response.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMITED",
          },
          { status: 429 }
        );
      }

      // Specific handling for model not found
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

    // Generic error response
    return Response.json(
      {
        error: "Failed to generate blog content. Please try again or contact support.",
        code: "GENERATION_FAILED",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
