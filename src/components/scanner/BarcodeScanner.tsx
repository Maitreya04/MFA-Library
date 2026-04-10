"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void;
}

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoEl,
        (result) => {
          if (result) {
            const text = result.getText();
            if (/^(978|979)?\d{9}[\dX]$/i.test(text.replace(/-/g, ""))) {
              onDetected(text.replace(/-/g, ""));
            }
          }
        }
      )
      .catch(() => {
        setError("Camera access denied. Use manual ISBN entry below.");
      });

    return () => {
      if (videoEl.srcObject) {
        (videoEl.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [onDetected]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-20 w-64 rounded border-2 border-white/60" />
      </div>
    </div>
  );
}
