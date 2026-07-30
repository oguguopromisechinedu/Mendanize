"use client";

import { RegisterServiceWorker } from "./register-sw";
import { PwaInstallPrompt } from "./install-prompt";

/** PWA shell — service worker + install prompt. Do not mount on /dashboard. */
export function PwaShell() {
  return (
    <>
      <RegisterServiceWorker />
      <PwaInstallPrompt />
    </>
  );
}
