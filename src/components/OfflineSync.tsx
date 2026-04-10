"use client";

import { useEffect } from "react";
import { flush } from "@/lib/offline-queue";

export default function OfflineSync() {
  useEffect(() => {
    function handleOnline() {
      flush().then(({ synced, failed }) => {
        if (synced > 0) {
          console.log(`[BookShelf] Synced ${synced} offline scans`);
        }
        if (failed > 0) {
          console.warn(`[BookShelf] Failed to sync ${failed} scans`);
        }
      });
    }

    window.addEventListener("online", handleOnline);

    // Also try flushing on mount in case we came back online before the component loaded
    if (navigator.onLine) handleOnline();

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
