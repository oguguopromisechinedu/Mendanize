import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/design";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black text-white">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-32 text-center sm:py-40 lg:py-48">

        {/* Badge */}
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
          AI-powered blogging platform
        </div>

        {/* Headline */}
        <h1 className="max-w-5xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Generate SEO-Focused Blog Content
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}That Ranks
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Generate publish-ready blog drafts optimized for search engines. Track visibility, improve rankings with AI suggestions, and grow your traffic using an all-in-one platform built for creators and teams.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Button asChild className="rounded-full px-8 py-3 text-base font-semibold">
            <Link href={routes.blogGenerator}>Start Free</Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="rounded-full border-white/20 bg-white/5 px-8 py-3 text-base text-white hover:bg-white/10 hover:border-white/40 transition-all"
          >
            <Link href={routes.learn}>See How It Works</Link>
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl border border-white/10 bg-black p-10 text-left">
            <div className="mb-4 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>

            <h3 className="text-xl font-semibold">
              AI Blog Generator
            </h3>

            <p className="mt-3 text-gray-400">
              Generate SEO-optimized blog articles instantly with AI assistance.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-gray-300">
              “Write a blog post about growing a startup using AI tools...”
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}