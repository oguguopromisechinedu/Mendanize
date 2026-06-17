import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mendanize — AI Blogging Growth Platform",
    template: "%s | Mendanize",
  },
  description:
    "AI-powered blog content generation, SEO optimization, and growth tools for creators and businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-slate-100">
        {children}
      </body>
    </html>
  );
}
