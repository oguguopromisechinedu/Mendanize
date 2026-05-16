"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BlogGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Beginners");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function generateBlog() {
    if (!topic) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          topic,
          tone,
          audience,
        }),
      });

      const data = await response.json();

      setResult(data.result || "No content generated.");
    } catch (error) {
      setResult("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight">
            AI Blog Generator
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            Generate SEO-friendly blog content using AI-powered writing tools.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[400px_1fr]">

          {/* Left Panel */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="space-y-6">

              {/* Topic */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Blog Topic
                </label>

                <Input
                  placeholder="e.g. How AI is changing blogging"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border-white/10 bg-black/40"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Tone
                </label>

                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Friendly</option>
                  <option>Persuasive</option>
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Target Audience
                </label>

                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option>Beginners</option>
                  <option>Creators</option>
                  <option>Businesses</option>
                  <option>Marketers</option>
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateBlog}
                disabled={loading}
                className="w-full rounded-xl py-6 text-base"
              >
                {loading ? "Generating..." : "Generate Blog"}
              </Button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

            {!result && !loading && (
              <div className="flex h-full items-center justify-center text-center text-gray-500">
                Your AI-generated blog content will appear here.
              </div>
            )}

            {loading && (
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse text-lg text-gray-400">
                  AI is writing your article...
                </div>
              </div>
            )}

            {result && (
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown>
                  {result}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}