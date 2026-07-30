"use client";

import Link from "next/link";
import { Mail, ExternalLink, Sparkles } from "lucide-react";
import { routes } from "@/lib/design";

/**
 * Legacy marketing footer — kept for non-public shells.
 * Prefer PublicFooter (CMS navigation) on the teaching frontend.
 */
const footerSections = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: routes.pricing },
      { label: "Learn", href: routes.learn },
      { label: "AI Tools", href: routes.aiTools },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Partners", href: "/partners" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "FAQ", href: "/faq" },
    ],
  },
};

const socialLinks = [
  {
    icon: ExternalLink,
    label: "X",
    href: "https://x.com/mendanize",
    color: "hover:text-blue-400",
  },
  {
    icon: ExternalLink,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/mendanize",
    color: "hover:text-blue-500",
  },
  {
    icon: ExternalLink,
    label: "GitHub",
    href: "https://github.com/mendanize",
    color: "hover:text-slate-300",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@mendanize.com",
    color: "hover:text-violet-400",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              href={routes.home}
              className="inline-flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.2em] text-white hover:text-violet-300 transition-colors"
            >
              <Sparkles className="h-5 w-5 text-violet-300" />
              Mendanize
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              Learn modern technology with clarity — guides, AI tools, and
              structured courses.
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

          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <p className="mb-4 font-semibold text-white">{section.title}</p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/50 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Mendanize. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
