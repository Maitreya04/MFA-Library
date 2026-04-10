import { getBookById } from "@/lib/notion";
import Link from "next/link";

export default async function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const book = await getBookById(params.id);

  if (!book) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-gray-500">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-2xl p-4">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to catalogue
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        {book.coverURL ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverURL}
            alt={book.title}
            className="h-72 w-48 rounded-xl object-cover shadow-md"
          />
        ) : (
          <div className="flex h-72 w-48 items-center justify-center rounded-xl bg-gray-100 text-5xl text-gray-300">
            &#128218;
          </div>
        )}

        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-gray-600">{book.author}</p>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                book.status === "Available"
                  ? "bg-green-50 text-green-700"
                  : book.status === "Borrowed"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {book.status}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
              {book.condition}
            </span>
            {book.language && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                {book.language}
              </span>
            )}
          </div>

          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">ISBN</dt>
              <dd className="text-gray-900">{book.isbn}</dd>
            </div>
            {book.shelfLocation && (
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">Shelf</dt>
                <dd className="text-gray-900">{book.shelfLocation}</dd>
              </div>
            )}
            {book.dateAdded && (
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">Added</dt>
                <dd className="text-gray-900">{book.dateAdded}</dd>
              </div>
            )}
          </dl>

          {book.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {book.genre.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {book.description && (
        <p className="mt-6 leading-relaxed text-gray-700">
          {book.description}
        </p>
      )}
    </div>
  );
}
