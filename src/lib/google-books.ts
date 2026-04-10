import type { EnrichedMetadata } from "@/types/book";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
const OPEN_LIBRARY_URL = "https://openlibrary.org/api/books";

// ── Google Books API ────────────────────────────────────────────────

async function fetchFromGoogle(isbn: string): Promise<EnrichedMetadata | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_URL}?q=isbn:${isbn}${apiKey ? `&key=${apiKey}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.items?.[0]?.volumeInfo;
  if (!item) return null;

  return {
    title: item.title ?? "",
    author: (item.authors ?? []).join(", "),
    genre: item.categories ?? [],
    subjectTags: [],
    coverURL: item.imageLinks?.thumbnail?.replace("http:", "https:") ?? "",
    description: item.description ?? "",
    language: item.language ?? "en",
  };
}

// ── Open Library fallback ───────────────────────────────────────────

async function fetchFromOpenLibrary(
  isbn: string
): Promise<EnrichedMetadata | null> {
  const url = `${OPEN_LIBRARY_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const item = data[`ISBN:${isbn}`];
  if (!item) return null;

  return {
    title: item.title ?? "",
    author: (item.authors ?? []).map((a: { name: string }) => a.name).join(", "),
    genre: (item.subjects ?? []).slice(0, 5).map((s: { name: string }) => s.name),
    subjectTags: [],
    coverURL: item.cover?.medium ?? "",
    description: item.notes ?? "",
    language: "",
  };
}

// ── Public: fallback chain ──────────────────────────────────────────

export async function fetchByISBN(
  isbn: string
): Promise<EnrichedMetadata | null> {
  const google = await fetchFromGoogle(isbn);
  if (google) return google;

  const openLib = await fetchFromOpenLibrary(isbn);
  if (openLib) return openLib;

  // Both failed — caller should prompt manual entry
  return null;
}
