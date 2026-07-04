"use client";

import { useEffect, useState } from "react";
import { SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (stored) {
      setIsDark(stored === "dark");
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      // default to dark
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button onClick={toggle} variant="ghost" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 hover:text-white hover:bg-white/5 transition-colors">
      <SunMoon className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
