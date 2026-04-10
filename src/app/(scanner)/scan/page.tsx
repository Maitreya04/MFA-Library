"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";

export default function ScanPage() {
  const router = useRouter();
  const [manualISBN, setManualISBN] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleISBN = useCallback(
    async (isbn: string) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      // Navigate to review page with the ISBN — enrichment happens there
      router.push(`/review?isbn=${isbn}`);
    },
    [loading, router]
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Scan a Book</h1>
        <p className="text-sm text-gray-500">
          Point camera at the barcode, or type the ISBN below
        </p>
      </header>

      <BarcodeScanner onDetected={handleISBN} />

      {/* Manual ISBN fallback */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cleaned = manualISBN.replace(/[-\s]/g, "");
          if (cleaned.length < 10) {
            setError("Enter a valid ISBN (10 or 13 digits)");
            return;
          }
          handleISBN(cleaned);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter ISBN manually"
          value={manualISBN}
          onChange={(e) => setManualISBN(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "…" : "Look up"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
