"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is there a free plan?",
    answer: "Yes, we offer a free tier with 5 blogs per month and access to basic features. Upgrade anytime to unlock unlimited content generation and advanced tools."
  },
  {
    question: "Does Mendanize really generate SEO-optimized content?",
    answer: "Absolutely. Our AI analyzes top-ranking content and applies SEO best practices like keyword optimization, readability improvements, and metadata generation to every article."
  },
  {
    question: "Can I edit the AI-generated content?",
    answer: "Yes! The AI output is a starting point. You can edit, refine, or rewrite any section directly in our editor. Most users make minimal edits because the quality is already high."
  },
  {
    question: "What languages are supported?",
    answer: "Currently we support English, Spanish, French, German, and Portuguese. Support for more languages is coming soon."
  },
  {
    question: "Is billing monthly or can I pay annually?",
    answer: "Both! We offer monthly and annual plans. Annual billing comes with 2 months free (25% discount), making it the most cost-effective option."
  },
  {
    question: "Can teams collaborate on the platform?",
    answer: "Yes, our Pro and Business plans include team collaboration features. Invite team members, assign roles, set permissions, and track content workflows."
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-slate-950/95 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Common questions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Have questions? We&apos;ve got answers. Contact our support team if you need help.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
              >
                <h3 className="text-base font-semibold text-white pr-4">{faq.question}</h3>
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-violet-300" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <p className="px-6 py-4 text-sm leading-7 text-slate-400">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
