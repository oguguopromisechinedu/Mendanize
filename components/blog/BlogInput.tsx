"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const tones = ["Professional", "Casual", "Friendly", "Persuasive", "Conversational"];
const audiences = ["Beginners", "Creators", "Marketers", "Businesses", "Growth teams"];
const lengths = [
  { label: "Short (600 words)", value: "short" },
  { label: "Medium (1,200 words)", value: "medium" },
  { label: "Long-form (2,000+ words)", value: "long" },
];

type BlogInputProps = {
  topic: string;
  tone: string;
  audience: string;
  length: string;
  keywords: string;
  notes: string;
  loading: boolean;
  onChange: (field: string, value: string) => void;
  onGenerate: () => void;
};

export default function BlogInput({
  topic,
  tone,
  audience,
  length,
  keywords,
  notes,
  loading,
  onChange,
  onGenerate,
}: BlogInputProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Blog prompt</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create your next post</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Use AI to generate optimized content for your audience, tone, and growth goals.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm text-slate-200">
            Blog topic
            <Input
              placeholder="e.g. How AI can grow your blog audience"
              value={topic}
              onChange={(event) => onChange("topic", event.target.value)}
              className="border-white/10 bg-black/40 text-white placeholder:text-slate-500"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Tone
              <select
                value={tone}
                onChange={(event) => onChange("tone", event.target.value)}
                className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none"
              >
                {tones.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Target audience
              <select
                value={audience}
                onChange={(event) => onChange("audience", event.target.value)}
                className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none"
              >
                {audiences.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Article length
              <select
                value={length}
                onChange={(event) => onChange("length", event.target.value)}
                className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none"
              >
                {lengths.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              SEO keywords
              <Input
                placeholder="e.g. blog growth, SEO strategy"
                value={keywords}
                onChange={(event) => onChange("keywords", event.target.value)}
                className="border-white/10 bg-black/40 text-white placeholder:text-slate-500"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm text-slate-200">
            Notes or audience context
            <Textarea
              placeholder="Add a short note for the writer, product detail, or business goal"
              value={notes}
              onChange={(event) => onChange("notes", event.target.value)}
              className="min-h-[136px] border-white/10 bg-black/40 text-white placeholder:text-slate-500"
            />
          </label>
        </div>

        <Button
          onClick={onGenerate}
          disabled={loading || !topic.trim()}
          className="w-full rounded-full py-5 text-base"
        >
          {loading ? "Generating AI article…" : "Generate blog draft"}
        </Button>
      </div>
    </section>
  );
}
