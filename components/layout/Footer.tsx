"use client";

import Link from "next/link";
import { Mail, ExternalLink, Sparkles } from "lucide-react";
import { routes } from "@/lib/design";

const footerSections = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: routes.pricing },
      { label: "Blog Generator", href: routes.blogGenerator },
      { label: "Resources", href: routes.learn },
    ]
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Support", href: "#" },
      { label: "Status", href: "#" },
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Disclaimer", href: "#" },
    ]
  },
};

const socialLinks = [
  { icon: ExternalLink, label: "Twitter", href: "#", color: "hover:text-blue-400" },
  { icon: ExternalLink, label: "LinkedIn", href: "#", color: "hover:text-blue-500" },
  { icon: ExternalLink, label: "GitHub", href: "#", color: "hover:text-slate-300" },
  { icon: Mail, label: "Email", href: "#", color: "hover:text-violet-400" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href={routes.home} className="inline-flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.2em] text-white hover:text-violet-300 transition-colors">
              <Sparkles className="h-5 w-5 text-violet-300" />
              Mendanize
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              Generate SEO-optimized blog content, grow your audience, and build a sustainable writing business with AI-powered tools.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-white/20 ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <p className="font-semibold text-white mb-4">{footerSections.product.title}</p>
            <ul className="space-y-3">
              {footerSections.product.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <p className="font-semibold text-white mb-4">{footerSections.company.title}</p>
            <ul className="space-y-3">
              {footerSections.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <p className="font-semibold text-white mb-4">{footerSections.legal.title}</p>
            <ul className="space-y-3">
              {footerSections.legal.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10 bg-slate-950/50 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              © 2026 Mendanize. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Built with <span className="text-violet-400">❤️</span> by the Mendanize team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
