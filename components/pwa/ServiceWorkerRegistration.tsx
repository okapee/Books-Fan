"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in browser environment
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register the service worker
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered successfully:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    });

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[PWA] Service Worker updated");
      // Optionally reload the page when SW updates
      // window.location.reload();
    });
  }, []);

  return null;
}
