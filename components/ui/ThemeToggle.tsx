"use client"

import { useEffect, useSyncExternalStore } from "react"
import { SunMoon } from "lucide-react"

import { Button } from "@/components/ui/button"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener("mendanize-theme", onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener("mendanize-theme", onStoreChange)
  }
}

function getThemeSnapshot() {
  return localStorage.getItem("theme") !== "light"
}

function getServerSnapshot() {
  return true
}

/** Theme toggle UI only (MES-004) — persists preference locally. */
export default function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerSnapshot
  )

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const toggle = () => {
    const next = !isDark
    localStorage.setItem("theme", next ? "dark" : "light")
    window.dispatchEvent(new Event("mendanize-theme"))
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <SunMoon className="size-5" />
    </Button>
  )
}
