"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Code2,
  Globe,
  Layers3,
  Mail,
  MessageCircle,
  Menu,
  Play,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const paths = [
  {
    label: "Learn",
    description: "Discover skills, follow learning paths, and get certified.",
    icon: Layers3,
    color: "text-sky-600",
  },
  {
    label: "Build",
    description: "Create websites, software, AI tools, and digital products.",
    icon: Code2,
    color: "text-indigo-600",
  },
  {
    label: "Marketplace",
    description: "Buy and sell digital products, tools, templates, and more.",
    icon: Sparkles,
    color: "text-violet-600",
  },
  {
    label: "Work",
    description: "Find digital jobs, hire talent, and earn income.",
    icon: BriefcaseBusiness,
    color: "text-emerald-600",
  },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="Mendanize home">
      <span className="grid size-8 place-items-center rounded-full border-2 border-current rotate-45">
        <span className="size-3.5 rounded-full bg-current" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-slate-950"}`}>
        Mendanize
      </span>
    </a>
  );
}

export function MendanizeLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-white text-slate-950">
      <section className="relative min-h-[680px] bg-[#061b2d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(56,189,248,.28),transparent_25%),radial-gradient(circle_at_65%_80%,rgba(37,99,235,.2),transparent_33%),linear-gradient(120deg,#061b2d_10%,#123a5c_55%,#0b2039_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:72px_72px]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Logo light />
          <nav className="hidden items-center gap-8 text-sm text-white/85 md:flex" aria-label="Main navigation">
            <a className="border-b border-white pb-1" href="#top">Home</a>
            <a href="#paths">Learn</a>
            <a href="#ai">Build</a>
            <a href="#paths">Marketplace</a>
            <a href="#community">Work</a>
            <a href="#community">Community</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button aria-label="Search" className="rounded-full p-2 text-white/80 hover:bg-white/10"><Search className="size-5" /></button>
            <a href="/sign-in" className="rounded-full border border-white/25 px-5 py-2 text-sm">Sign In</a>
            <a href="/sign-up" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950">Get Started Free</a>
          </div>
          <button className="rounded-full p-2 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>
        {menuOpen && (
          <nav className="relative z-20 mx-5 flex flex-col gap-4 rounded-2xl bg-slate-950/95 p-6 text-sm md:hidden" aria-label="Mobile navigation">
            {['Home', 'Learn', 'Build', 'Marketplace', 'Work', 'Community'].map((item) => <a key={item} href={item === 'Home' ? '#top' : '#paths'} onClick={() => setMenuOpen(false)}>{item}</a>)}
            <a href="/sign-up" className="rounded-full bg-white px-4 py-2 text-center font-semibold text-slate-950">Get Started Free</a>
          </nav>
        )}
        <div className="relative z-10 mx-auto flex max-w-7xl px-6 pb-24 pt-24 lg:px-10 lg:pb-36 lg:pt-28">
          <div className="max-w-2xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[.2em] text-sky-200">Mendanize</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-7xl lg:text-[5.8rem]">Learn. Build.<br />Work. Earn.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/75 sm:text-lg">One intelligent platform for turning digital skills into real opportunities. Learn new skills, build digital products, find work and earn — all in one place.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="/sign-up" className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950">Get Started Free <ArrowRight className="size-4" /></a>
              <a href="#ai" className="inline-flex items-center gap-3 text-sm font-medium text-white"><span className="grid size-10 place-items-center rounded-full border border-white/40"><Play className="ml-0.5 size-4 fill-current" /></span>Explore Platform</a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      <section id="paths" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-sky-700">What you can do</p><h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Everything you need to grow in the digital world.</h2></div>
          <p className="max-w-md text-base leading-7 text-slate-500">Whether you’re learning a new skill, building a product, looking for work or selling your creations — Mendanize gives you the tools, people and AI support to go further.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map(({ label, description, icon: Icon, color }) => <a key={label} href="#community" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`mb-8 grid size-12 place-items-center rounded-xl bg-slate-50 ${color}`}><Icon className="size-6" /></div><h3 className="text-xl font-semibold">{label}</h3><p className="mt-3 min-h-14 text-sm leading-6 text-slate-500">{description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">Explore {label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></a>)}
        </div>
      </section>

      <section id="ai" className="bg-[#071c2d] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
          <div><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-sky-300">Powered by AI</p><h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Smarter tools.<br />Better results.</h2><p className="mt-6 max-w-md leading-7 text-slate-300">Mendanize AI helps you learn faster, build smarter, and work more efficiently with intelligent assistance at every step.</p><a href="/account/ai-tools" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950">Discover Mendanize AI <ArrowRight className="size-4" /></a></div>
          <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#123b61] to-[#33245d] p-5 shadow-2xl"><div className="absolute -right-12 -top-16 size-64 rounded-full bg-cyan-400/20 blur-3xl" /><div className="relative ml-auto max-w-sm rounded-2xl border border-white/15 bg-slate-950/70 p-5 shadow-2xl backdrop-blur"><div className="mb-8 flex items-center justify-between text-xs text-slate-300"><span className="flex items-center gap-2"><Sparkles className="size-4 text-cyan-300" /> Mendanize AI</span><span>×</span></div><p className="mb-5 text-lg font-medium">How can I help you today?</p>{['Learn a new skill', 'Build a project', 'Find a job', 'Explore the marketplace'].map((item) => <div key={item} className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{item}</div>)}</div></div>
        </div>
      </section>

      <section id="community" className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-28"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-sky-700">More than a platform</p><h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">A growing ecosystem for your digital future.</h2><p className="mt-6 max-w-lg leading-7 text-slate-500">Mendanize is more than a platform — it’s a community and ecosystem built for creators, learners, builders and doers.</p><div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-7"><div><p className="text-2xl font-semibold">500K+</p><p className="mt-1 text-xs text-slate-500">Active Learners</p></div><div><p className="text-2xl font-semibold">100K+</p><p className="mt-1 text-xs text-slate-500">Digital Products</p></div><div><p className="text-2xl font-semibold">50K+</p><p className="mt-1 text-xs text-slate-500">Jobs & Opportunities</p></div></div></div><div className="rounded-[2rem] bg-sky-50 p-8"><div className="rounded-2xl bg-white p-7 shadow-sm"><Users className="size-8 text-sky-600" /><h3 className="mt-12 text-2xl font-semibold">Find your people.</h3><p className="mt-3 leading-7 text-slate-500">Share ideas, collaborate on projects, and connect with people moving in the same direction.</p><a href="/account/community" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">Join the community <ArrowRight className="size-4" /></a></div></div></section>

      <section className="relative overflow-hidden bg-slate-900 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,.25),transparent_30%),linear-gradient(120deg,#071c2d,#172d4a)]" /><div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 px-6 py-20 lg:flex-row lg:items-end lg:px-10 lg:py-24"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-sky-300">Your next chapter starts here</p><h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Join a platform built for your growth, freedom and success.</h2><p className="mt-5 text-slate-300">Learn. Build. Work. Earn. — with Mendanize.</p><a href="/sign-up" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950">Get Started Free <ArrowRight className="size-4" /></a></div><div className="flex items-center gap-3 text-sm text-white/80"><span className="grid size-10 place-items-center rounded-full border border-white/30"><Play className="ml-0.5 size-4 fill-current" /></span>Watch Video</div></div></section>

      <footer className="bg-[#061b2d] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-10 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
            <div className="max-w-sm">
              <Logo light />
              <p className="mt-6 text-sm leading-7 text-slate-300">The intelligent platform for learning digital skills, building products, finding opportunities, and creating a future on your terms.</p>
              <div className="mt-7 flex items-center gap-3">
                {[{ label: "Community", icon: MessageCircle, href: "#community" }, { label: "Website", icon: Globe, href: "#top" }, { label: "Contact", icon: Mail, href: "#top" }].map(({ label, icon: Icon, href }) => <a key={label} href={href} aria-label={label} className="grid size-10 place-items-center rounded-full border border-white/15 text-slate-300 transition hover:border-sky-300 hover:text-white"><Icon className="size-4" /></a>)}
              </div>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              <div><h3 className="text-sm font-semibold text-white">Platform</h3><div className="mt-5 flex flex-col gap-3 text-sm text-slate-300"><a href="#paths" className="hover:text-white">Learn</a><a href="#ai" className="hover:text-white">Build</a><a href="#paths" className="hover:text-white">Marketplace</a><a href="#community" className="hover:text-white">Work</a></div></div>
              <div><h3 className="text-sm font-semibold text-white">Resources</h3><div className="mt-5 flex flex-col gap-3 text-sm text-slate-300"><a href="#ai" className="hover:text-white">Mendanize AI</a><a href="#community" className="hover:text-white">Community</a><a href="/templates" className="hover:text-white">Templates</a><a href="/tools" className="hover:text-white">Tools</a></div></div>
              <div><h3 className="text-sm font-semibold text-white">Company</h3><div className="mt-5 flex flex-col gap-3 text-sm text-slate-300"><a href="#top" className="hover:text-white">About us</a><a href="#community" className="hover:text-white">Careers</a><a href="#top" className="hover:text-white">Contact</a><a href="#top" className="hover:text-white">Blog</a></div></div>
            </div>
          </div>
          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[.05] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8"><div><div className="flex items-center gap-2 text-sm font-semibold"><Mail className="size-4 text-sky-300" /> Stay in the loop</div><p className="mt-2 text-sm text-slate-300">Get practical insights, opportunities, and product updates.</p></div><form className="mt-5 flex max-w-md gap-2 sm:mt-0" onSubmit={(event) => event.preventDefault()}><label htmlFor="footer-email" className="sr-only">Email address</label><input id="footer-email" type="email" required placeholder="Your email address" className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-300" /><button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950">Subscribe <ArrowRight className="size-4" /></button></form></div>
          <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Mendanize. All rights reserved.</p><div className="flex flex-wrap gap-5"><a href="#top" className="hover:text-white">Privacy Policy</a><a href="#top" className="hover:text-white">Terms of Service</a><a href="#top" className="hover:text-white">Cookies</a><a href="#top" className="inline-flex items-center gap-1 hover:text-white">Back to top <ArrowUpRight className="size-3" /></a></div></div>
        </div>
      </footer>
    </main>
  );
}
