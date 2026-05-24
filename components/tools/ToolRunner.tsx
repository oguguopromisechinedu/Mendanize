"use client";

import { useState } from "react";
import {
  FileText,
  Hash,
  Camera,
  Mail,
  Package,
  PenLine,
  Lightbulb,
  Megaphone,
  Video,
  Briefcase,
  Bot,
  Search,
  Copy,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { AITool } from "@/lib/tools/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

type ToolRunnerProps = {
  tool: Omit<AITool, "buildPrompt" | "icon">;
};

const iconMap = {
  FileText,
  Hash,
  Camera,
  Mail,
  Package,
  PenLine,
  Lightbulb,
  Megaphone,
  Video,
  Briefcase,
  Bot,
  Search,
} as const;

export default function ToolRunner({ tool }: ToolRunnerProps) {
  const Icon = iconMap[tool.iconName as keyof typeof iconMap] ?? FileText;
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
      <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20">
            <Icon className="h-6 w-6 text-violet-300" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
            <p className="text-sm text-slate-400">{tool.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {tool.fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                {field.label}
                {field.required && <span className="text-violet-400"> *</span>}
              </label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => update(field.name, e.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                  rows={4}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? field.options?.[0] ?? ""}
                  onChange={(e) => update(field.name, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => update(field.name, e.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 font-semibold text-slate-950"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      <div className="min-h-[400px] rounded-3xl border border-white/10 bg-black/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Output
          </h2>
          {result && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              <Copy className="mr-1 h-4 w-4" />
              Copy
            </Button>
          )}
        </div>
        {result ? (
          <MarkdownRenderer content={result} />
        ) : (
          <p className="text-sm text-slate-500">
            Your AI-generated output will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
