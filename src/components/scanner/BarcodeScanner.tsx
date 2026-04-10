"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void;
}

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoEl,
        (result) => {
          if (!scanning) setScanning(true);

          if (result) {
            const text = result.getText();
            if (/^(978|979)?\d{9}[\dX]$/i.test(text.replace(/-/g, ""))) {
              setFlash(true);
              onDetected(text.replace(/-/g, ""));
            }
          }
        }
      )
      .then(() => setScanning(true))
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
  }, [onDetected, scanning]);

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

      {/* Scanning overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
        {/* Guide rectangle */}
        <div
          className={`h-20 w-64 rounded border-2 transition-colors duration-200 ${
            flash ? "border-green-400" : "border-white/60"
          }`}
        />

        {/* Animated scan line */}
        {scanning && !flash && (
          <div className="absolute left-1/2 h-0.5 w-56 -translate-x-1/2 animate-pulse bg-indigo-400/70" />
        )}
      </div>

      {/* Status badge */}
      <div className="absolute bottom-3 left-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
            flash
              ? "bg-green-500 text-white"
              : scanning
                ? "bg-white/80 text-gray-700"
                : "bg-gray-800/60 text-white"
          }`}
        >
          {flash
            ? "Barcode detected!"
            : scanning
              ? "Scanning…"
              : "Starting camera…"}
        </span>
      </div>
    </div>
  );
}
