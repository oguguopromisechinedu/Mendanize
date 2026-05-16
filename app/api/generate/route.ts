import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic, tone, audience } = await req.json();

    const prompt = `
    Write a detailed SEO-friendly blog post.

    Topic: ${topic}
    Tone: ${tone}
    Audience: ${audience}

    Include:
    - Engaging title
    - Introduction
    - Headings
    - Conclusion
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });

  } catch (error) {
    return Response.json({
      error: "Something went wrong.",
    });
  }
}