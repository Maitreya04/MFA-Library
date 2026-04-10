"use client";

import type { Book } from "@/types/book";
import Link from "next/link";

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No books found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="aspect-[2/3] w-full bg-gray-100">
            {book.coverURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={book.coverURL}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl text-gray-300">
                &#128218;
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col p-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
              {book.title}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">{book.author}</p>
            <span
              className={`mt-auto inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-medium ${
                book.status === "Available"
                  ? "bg-green-50 text-green-700"
                  : book.status === "Borrowed"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {book.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
