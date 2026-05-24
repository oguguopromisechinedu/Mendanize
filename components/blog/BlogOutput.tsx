"use client";

import { Copy, Download, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

type BlogOutputProps = {
  loading: boolean;
  error: string;
  result: string;
  copied: boolean;
  onCopy: () => void;
  onExport: () => void;
  onRegenerate: () => void;
};

export default function BlogOutput({
  loading,
  error,
  result,
  copied,
  onCopy,
  onExport,
  onRegenerate,
}: BlogOutputProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">AI output</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Published-ready markdown</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={onRegenerate} className="rounded-full px-4 py-2">
            <RefreshCcw className="mr-2 h-4 w-4" /> Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy} className="rounded-full px-4 py-2">
            <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="rounded-full px-4 py-2">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/40 p-10 text-center text-lg text-slate-400">
          AI is writing your article…
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && !result && (
        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/40 p-10 text-center text-slate-500">
          Your AI-generated blog content will appear here once you submit a prompt.
        </div>
      )}

      {result && !loading && (
        <article className="prose prose-invert mt-8 max-w-none">
          <ReactMarkdown>{result}</ReactMarkdown>
        </article>
      )}
    </section>
  );
}
