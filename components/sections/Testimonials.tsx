"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    id: "testimonial-ava-martin",
    quote: "Reduced content creation time by 60% and improved search traffic by 150% in 3 months.",
    name: "Ava Martin",
    title: "Founder, Content Pulse",
    metric: "+150% organic traffic"
  },
  {
    id: "testimonial-noah-carter",
    quote: "The AI workflow keeps our editorial calendar on track. We're publishing 3x faster now.",
    name: "Noah Carter",
    title: "Growth Lead, Studio Nine",
    metric: "3x faster publishing"
  },
  {
    id: "testimonial-lina-patel",
    quote: "Beautiful dashboard, thoughtful tools. Generated 28% more revenue from our blog.",
    name: "Lina Patel",
    title: "Creator, Growth Stories",
    metric: "+28% blog revenue"
  },
  {
    id: "testimonial-james-chen",
    quote: "Finally a tool that understands blogging. Our monthly traffic went from 5K to 32K.",
    name: "James Chen",
    title: "Blogger, Tech Insights",
    metric: "+540% monthly traffic"
  },
  {
    id: "testimonial-sarah-williams",
    quote: "Mendanize took our SEO from 30% visibility to 89% in 6 months. Game-changer.",
    name: "Sarah Williams",
    title: "Marketing Manager, Digital Co",
    metric: "+196% SEO visibility"
  },
  {
    id: "testimonial-marcus-johnson",
    quote: "The best investment we made for our content team. ROI is incredible.",
    name: "Marcus Johnson",
    title: "Content Director, StartupXYZ",
    metric: "300% ROI in 6 months"
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-950 px-6 py-24 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Social proof</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted by creators and growth teams.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Real results from real users. See how Mendanize transformed their content strategy.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/20 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-400/10 text-xl font-semibold text-violet-200">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">{item.title}</p>
                </div>
              </div>
              <p className="mt-6 text-base leading-8 text-slate-300">“{item.quote}”</p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm font-semibold text-violet-300">{item.metric}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
