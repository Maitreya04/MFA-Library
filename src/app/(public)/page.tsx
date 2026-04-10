"use client";

import { useEffect, useMemo, useState } from "react";
import type { Book } from "@/types/book";
import SearchBar from "@/components/catalogue/SearchBar";
import FilterChips from "@/components/catalogue/FilterChips";
import BookGrid from "@/components/catalogue/BookGrid";

export default function CataloguePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/books/list")
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Unique genres from the loaded books
  const genres = useMemo(
    () => Array.from(new Set(books.flatMap((b) => b.genre))).sort(),
    [books]
  );

  // Client-side filter + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return books.filter((b) => {
      if (genreFilter && !b.genre.includes(genreFilter)) return false;
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !b.author.toLowerCase().includes(q) &&
        !b.isbn.includes(q)
      )
        return false;
      return true;
    });
  }, [books, search, genreFilter]);

  return (
    <div className="mx-auto min-h-dvh max-w-4xl p-4">
      <header className="mb-6">
        <p className="text-sm text-gray-500">
          Browse the school library catalogue
        </p>
      </header>

      <div className="mb-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        {genres.length > 0 && (
          <FilterChips
            options={genres}
            selected={genreFilter}
            onSelect={setGenreFilter}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <BookGrid books={filtered} />
      )}
    </div>
  );
}
