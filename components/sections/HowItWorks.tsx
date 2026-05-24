"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Enter Topic",
    description: "Tell the AI what blog content you want. Provide keywords, target audience, or specific goals.",
  },
  {
    title: "Generate & Optimize",
    description: "AI creates a publish-ready draft with SEO improvements, keyword optimization, and readability enhancements.",
  },
  {
    title: "Publish & Grow",
    description: "Export your content, publish it instantly, and track performance with AI-powered analytics.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300 font-semibold">Simple workflow</p>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            3 simple steps to grow your blog.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400 sm:text-xl">
            From idea to published, optimized content. No technical skills required.
          </p>
        </div>

        <div className="relative mt-20 grid gap-8 lg:grid-cols-3">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-white/10 lg:block" />

          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950/80 text-xl font-semibold text-white">
                {index + 1}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
