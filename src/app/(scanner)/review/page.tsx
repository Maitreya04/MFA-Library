"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookConfirmCard from "@/components/scanner/BookConfirmCard";
import type { EnrichedMetadata, BookCondition } from "@/types/book";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isbn = searchParams.get("isbn") ?? "";

  const [metadata, setMetadata] = useState<EnrichedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Enrich on mount
  useEffect(() => {
    if (!isbn) return;

    fetch(`/api/enrich?isbn=${isbn}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setMetadata)
      .catch(() =>
        setError("Could not find metadata. You can enter details manually.")
      )
      .finally(() => setLoading(false));
  }, [isbn]);

  async function handleConfirm(extra: {
    shelfLocation: string;
    condition: BookCondition;
  }) {
    if (!metadata) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/books/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isbn,
        title: metadata.title,
        author: metadata.author,
        genre: metadata.genre,
        subjectTags: metadata.subjectTags,
        coverURL: metadata.coverURL,
        description: metadata.description,
        language: metadata.language,
        status: "Available",
        shelfLocation: extra.shelfLocation,
        condition: extra.condition,
        addedBy: "", // Will be populated by session once auth is wired
      }),
    });

    if (res.status === 409) {
      setError("This book is already in the library.");
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      setError("Failed to save. Try again.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
  }

  if (!isbn) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <p className="text-gray-500">No ISBN provided.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-5xl">&#10003;</div>
        <h2 className="text-xl font-semibold text-gray-900">Book added!</h2>
        <p className="text-sm text-gray-500">
          &ldquo;{metadata?.title}&rdquo; is now in the catalogue.
        </p>
        <button
          onClick={() => router.push("/scan")}
          className="mt-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Scan another
        </button>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-gray-500">{error ?? "No metadata found."}</p>
        <button
          onClick={() => router.push("/scan")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Back to scanner
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Confirm Details</h1>
        <p className="text-sm text-gray-500">
          Verify the info below, then add to the library
        </p>
      </header>

      <BookConfirmCard
        isbn={isbn}
        metadata={metadata}
        onConfirm={handleConfirm}
        onCancel={() => router.push("/scan")}
        submitting={submitting}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
