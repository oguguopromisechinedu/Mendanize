import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black text-white">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">

        {/* Badge */}
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
          AI-powered blogging platform
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Build Smarter Blogs
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}With AI
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Mendanize helps creators, businesses, and beginners generate
          high-quality blog content, improve SEO, and grow faster using AI.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button className="rounded-full px-8 py-6 text-base">
            Start Writing Free
          </Button>

          <Button
            variant="outline"
            className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-base text-white hover:bg-white/10"
          >
            Watch Demo
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