"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  DollarSign,
  Search,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Blog Generator",
    description: "Generate publish-ready blog drafts optimized for readability and SEO rankings.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Analyze keywords, audit content, and boost organic traffic with smart recommendations.",
  },
  {
    icon: DollarSign,
    title: "Monetization Tools",
    description: "Turn every article into revenue through affiliate links, sponsorships, and ad placements.",
  },
  {
    icon: CalendarDays,
    title: "Content Planner",
    description: "Schedule posts, plan editorial calendars, and maintain consistent publishing rhythm effortlessly.",
  },
  {
    icon: BookOpen,
    title: "Learning Academy",
    description: "Master blogging, SEO strategy, and growth tactics from expert-curated lessons and templates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Monitor traffic, engagement, and revenue performance with clear, actionable AI-powered insights.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950/95 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300 font-semibold">Core features</p>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything needed to grow your blog faster.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400 sm:text-xl">
            From content creation to revenue generation. One integrated platform, zero switching costs.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-violet-400 via-cyan-400 to-sky-300 opacity-60" />
                <div className="relative space-y-5 pt-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950/80 text-cyan-300 shadow-lg shadow-cyan-500/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm leading-7 text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
