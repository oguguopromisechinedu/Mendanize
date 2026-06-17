"use client";

import { motion } from "framer-motion";

const trustItems = [
  {
    icon: "🚀",
    label: "AI-Powered Workflows",
    description: "Content generation in minutes"
  },
  {
    icon: "🔒",
    label: "Secure Platform",
    description: "Enterprise-grade encryption"
  },
  {
    icon: "⚡",
    label: "Fast & Reliable",
    description: "99.9% uptime guaranteed"
  },
  {
    icon: "📈",
    label: "Proven Results",
    description: "2.3M blogs generated"
  },
];

export default function TrustStrip() {
  return (
    <section className="border-t border-white/10 bg-slate-950/50 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">{item.label}</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
