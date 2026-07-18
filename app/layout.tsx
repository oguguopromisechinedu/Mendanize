import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { DesignTokensStyle } from "@/components/layout/DesignTokensStyle";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mendanize — AI Technology Learning Platform",
    template: "%s | Mendanize",
  },
  description:
    "Learn modern technology through educational content, curated AI tools, structured guides, and intelligent assistance.",
};

/** DB-backed layouts/pages (nav, tokens, CMS) — skip static prerender at build. */
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${display.variable} ${body.variable}`}
    >
      <head>
        <DesignTokensStyle />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
