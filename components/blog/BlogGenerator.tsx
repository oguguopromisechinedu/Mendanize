"use client";

import { useState } from "react";
import BlogInput from "@/components/blog/BlogInput";
import BlogOutput from "@/components/blog/BlogOutput";

const defaultTone = "Professional";
const defaultAudience = "Beginners";
const defaultLength = "medium";

export default function BlogGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState(defaultTone);
  const [audience, setAudience] = useState(defaultAudience);
  const [length, setLength] = useState(defaultLength);
  const [keywords, setKeywords] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateBlog() {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || loading) return;

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          tone,
          audience,
          length,
          keywords: keywords.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to generate content.");
        return;
      }

      setResult(data.result ?? "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function exportMarkdown() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mendanize-article.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">AI content studio</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Generate SEO-ready blog content with precision.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Customize tone, audience, keywords, and article length. Mendanize drafts structured markdown so you can publish faster.
          </p>
        </div>

        <BlogInput
          topic={topic}
          tone={tone}
          audience={audience}
          length={length}
          keywords={keywords}
          notes={notes}
          loading={loading}
          onChange={(field, value) => {
            switch (field) {
              case "topic":
                setTopic(value);
                break;
              case "tone":
                setTone(value);
                break;
              case "audience":
                setAudience(value);
                break;
              case "length":
                setLength(value);
                break;
              case "keywords":
                setKeywords(value);
                break;
              case "notes":
                setNotes(value);
                break;
            }
          }}
          onGenerate={generateBlog}
        />
      </div>

      <BlogOutput
        error={error}
        loading={loading}
        result={result}
        copied={copied}
        onCopy={copyMarkdown}
        onExport={exportMarkdown}
        onRegenerate={generateBlog}
      />
    </div>
  );
}
