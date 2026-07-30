"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PWA_INSTALL_DISMISS_DAYS,
  PWA_INSTALL_DISMISS_KEY,
} from "@/lib/pwa/constants";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(PWA_INSTALL_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < PWA_INSTALL_DISMISS_DAYS;
  } catch {
    return false;
  }
}

/**
 * Respects platform install norms — shows once, dismissible for 14 days.
 * Does not nag on every page load.
 */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/dashboard")) return;
    if (isDismissedRecently()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferred) return null;

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function handleDismiss() {
    try {
      localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
    setDeferred(null);
  }

  return (
    <div
      role="region"
      aria-label="Install Mendanize app"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border bg-card p-4 shadow-lg sm:left-auto"
    >
      <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Install Mendanize</p>
        <p className="text-xs text-muted-foreground">
          Add to your home screen for quick access and offline reading.
        </p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        Install
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        className="rounded p-1 text-muted-foreground hover:bg-muted"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
