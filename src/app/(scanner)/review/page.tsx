"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BookConfirmCard from "@/components/scanner/BookConfirmCard";
import type { EnrichedMetadata, BookCondition } from "@/types/book";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60dvh] items-center justify-center">
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
  const [enrichFailed, setEnrichFailed] = useState(false);
  const [success, setSuccess] = useState<{
    title: string;
    bookId: string;
  } | null>(null);

  // Enrich on mount
  useEffect(() => {
    if (!isbn) return;

    fetch(`/api/enrich?isbn=${isbn}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setMetadata)
      .catch(() => setEnrichFailed(true))
      .finally(() => setLoading(false));
  }, [isbn]);

  async function handleConfirm(data: {
    title: string;
    author: string;
    genre: string[];
    subjectTags: string[];
    description: string;
    language: string;
    coverURL: string;
    shelfLocation: string;
    condition: BookCondition;
    addedBy: string;
  }) {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/books/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isbn,
        title: data.title,
        author: data.author,
        genre: data.genre,
        subjectTags: data.subjectTags,
        coverURL: data.coverURL,
        description: data.description,
        language: data.language,
        status: "Available",
        shelfLocation: data.shelfLocation,
        condition: data.condition,
        addedBy: data.addedBy,
      }),
    });

    if (res.status === 409) {
      setError("This book (ISBN) is already in the library.");
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      setError("Failed to save. Try again.");
      setSubmitting(false);
      return;
    }

    const book = await res.json();
    setSuccess({ title: data.title, bookId: book.id });
  }

  // ── No ISBN ───────────────────────────────────────────────────────
  if (!isbn) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <p className="text-gray-500">No ISBN provided.</p>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-gray-500">
          Looking up ISBN {isbn}…
        </p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          &#10003;
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Book added!</h2>
        <p className="text-sm text-gray-500">
          &ldquo;{success.title}&rdquo; is now in the catalogue.
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Link
            href={`/books/${success.bookId}`}
            className="rounded-lg border border-indigo-600 px-5 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            View Book
          </Link>
          <button
            onClick={() => router.push("/scan")}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Scan Another
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Review / Manual entry form ────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {enrichFailed ? "Enter Book Details" : "Confirm Details"}
        </h1>
        <p className="text-sm text-gray-500">
          {enrichFailed
            ? "We couldn\u2019t find this book automatically. Fill in what you can."
            : "Verify and edit the info below, then add to the library"}
        </p>
      </header>

      <BookConfirmCard
        isbn={isbn}
        metadata={enrichFailed ? null : metadata}
        onConfirm={handleConfirm}
        onCancel={() => router.push("/scan")}
        submitting={submitting}
      />

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
