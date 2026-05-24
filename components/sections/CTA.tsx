"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/design";

export default function CTA() {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/5 px-8 py-20 shadow-2xl shadow-slate-950/30 backdrop-blur-xl text-center md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300 font-semibold">Ready to grow?</p>
          
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
            Start creating blog content
            <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              that ranks today
            </span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Join creators who are publishing better content, ranking higher, and growing their audience faster. No credit card required to start.
          </p>

          <div className="mt-10 flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full px-10 py-4 text-base font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all">
              <Link href={routes.blogGenerator}>Start Free Today</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-white/20 bg-white/5 px-10 py-4 text-base font-semibold text-white hover:bg-white/15 hover:border-white/40 transition-all">
              <Link href={routes.learn}>Watch Demo →</Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            ✓ 5 free blogs per month • ✓ 14-day money-back guarantee • ✓ Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
