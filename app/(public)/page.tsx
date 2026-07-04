import Link from "next/link";
import { routes } from "@/lib/design";

export default function PublicHomePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-24 sm:px-10">
      <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Publishing platform</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
        Read the story, publish the next chapter.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        Mendanize is now structured as a clean public publishing experience with a separate, admin-only editorial workspace.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href={routes.blog} className="rounded-full bg-violet-500 px-6 py-3 font-semibold text-white hover:bg-violet-400">
          Explore articles
        </Link>
        <Link href="/about" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10">
          Learn more
        </Link>
      </div>
    </section>
  );
}
