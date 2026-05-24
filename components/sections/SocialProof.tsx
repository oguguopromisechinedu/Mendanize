"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Blogs Generated", value: "2.3M+", context: "by creators worldwide" },
  { label: "Avg Traffic Growth", value: "89%", context: "within 6 months" },
  { label: "SEO Visibility Gain", value: "47%", context: "average improvement" },
];

const logos = ["Vercel", "Notion", "Framer", "Linear", "Jasper"];

export default function SocialProof() {
  return (
    <section className="border-t border-white/10 bg-slate-950/95 px-6 py-20 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Trusted by fast-growing creators</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Join thousands growing their blogs with AI.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Real creators building sustainable audiences and revenue streams with Mendanize.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {stats.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-xl shadow-slate-950/20 backdrop-blur-xl hover:border-white/20 hover:bg-white/10 transition-all"
            >
              <p className="text-5xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">{item.value}</p>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] font-semibold text-slate-300">{item.label}</p>
              <p className="mt-2 text-xs text-slate-500">{item.context}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-12 backdrop-blur-xl sm:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 text-center sm:text-left">Trusted by leading companies</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-5 items-center justify-center sm:justify-start">
            {logos.map((logo) => (
              <div
                key={logo}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-xs uppercase tracking-[0.25em] text-slate-400 shadow-sm shadow-slate-950/10 text-center font-medium hover:border-white/20 hover:text-slate-300 transition-all"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
