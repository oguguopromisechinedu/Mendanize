import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsBeacon } from "@/components/analytics/analytics-beacon";
import { DesignTokensStyle } from "@/components/layout/DesignTokensStyle";
import SessionProvider from "@/components/providers/SessionProvider";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mendanize",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
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
        <SessionProvider>
          {children}
          <Toaster />
          <Suspense fallback={null}>
            <AnalyticsBeacon />
          </Suspense>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
