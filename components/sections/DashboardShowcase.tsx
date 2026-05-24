"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, BarChart3, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Generate",
    description: "Create SEO-ready blog content in minutes with AI assistance"
  },
  {
    icon: BarChart3,
    title: "Analyze",
    description: "Track visibility and content performance in real-time"
  },
  {
    icon: TrendingUp,
    title: "Optimize",
    description: "Improve rankings using AI-powered suggestions and insights"
  },
];

export default function DashboardShowcase() {
  return (
    <section id="dashboard" className="bg-slate-950/95 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
          >
            <div className="grid gap-8">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-sm text-slate-300">
                <div className="space-y-1">
                  <p className="font-medium text-white">Campaign overview</p>
                  <p className="text-xs text-slate-500">AI insights for blog momentum</p>
                </div>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-300 font-semibold">
                  Live
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 hover:border-white/20 hover:bg-slate-950/90 transition-all">
                  <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Sessions</p>
                  <p className="mt-4 text-3xl font-bold text-white">18.4K</p>
                  <p className="mt-2 text-xs text-slate-500">+12% vs last month</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 hover:border-white/20 hover:bg-slate-950/90 transition-all">
                  <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Engagement</p>
                  <p className="mt-4 text-3xl font-bold text-white">72.1%</p>
                  <p className="mt-2 text-xs text-slate-500">Average read time</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 hover:border-white/20 hover:bg-slate-950/90 transition-all">
                  <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Revenue</p>
                  <p className="mt-4 text-3xl font-bold text-white">$14.2K</p>
                  <p className="mt-2 text-xs text-slate-500">from blog traffic</p>
                </div>
              </div>

              <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="uppercase tracking-[0.26em] text-slate-400 font-semibold">SEO score</span>
                  <span className="font-bold text-white">92 / 100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-11/12 rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-sky-300" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300 font-semibold">Why choose Mendanize</p>
              <h3 className="text-4xl font-bold text-white leading-tight">
                Everything you need in one platform
              </h3>
              <p className="text-lg leading-8 text-slate-400">
                From content generation to performance tracking—manage your entire blog workflow without switching between tools.
              </p>
            </div>

            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition-all"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                    <Icon className="h-6 w-6 text-violet-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{benefit.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
